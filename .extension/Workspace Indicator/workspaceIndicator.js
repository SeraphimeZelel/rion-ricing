// SPDX-FileCopyrightText: 2011 Erick Pérez Castellanos <erick.red@gmail.com>
// SPDX-FileCopyrightText: 2011 Giovanni Campagna <gcampagna@src.gnome.org>
// SPDX-FileCopyrightText: 2017 Florian Müllner <fmuellner@gnome.org>
//
// SPDX-License-Identifier: GPL-2.0-or-later

import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';

import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

import * as DND from 'resource:///org/gnome/shell/ui/dnd.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import {ensureActorVisibleInScrollView} from 'resource:///org/gnome/shell/misc/animationUtils.js';

const TOOLTIP_OFFSET = 6;
const TOOLTIP_ANIMATION_TIME = 150;

const SCROLL_TIME = 100;

let baseStyleClassName = '';

class WindowPreview extends St.Button {
    static {
        GObject.registerClass(this);
    }

    constructor(window) {
        super({
            style_class: `${baseStyleClassName}-window-preview`,
        });

        this._delegate = this;
        DND.makeDraggable(this, {restoreOnSuccess: true});

        this._window = window;

        this._window.connectObject(
            'size-changed', () => this._checkRelayout(),
            'position-changed', () => this._checkRelayout(),
            'notify::minimized', this._updateVisible.bind(this),
            'notify::skip-taskbar', this._updateVisible.bind(this),
            this);
        this._updateVisible();

        global.display.connectObject('notify::focus-window',
            this._onFocusChanged.bind(this), this);
        this._onFocusChanged();
    }

    // needed for DND
    get metaWindow() {
        return this._window;
    }

    _onFocusChanged() {
        if (global.display.focus_window === this._window)
            this.add_style_class_name('active');
        else
            this.remove_style_class_name('active');
    }

    _checkRelayout() {
        const monitor = Main.layoutManager.findIndexForActor(this);
        const workArea = Main.layoutManager.getWorkAreaForMonitor(monitor);
        if (this._window.get_frame_rect().overlap(workArea))
            this.queue_relayout();
    }

    _updateVisible() {
        this.visible = !this._window.skip_taskbar &&
            this._window.showing_on_its_workspace();
    }
}

class WorkspaceLayout extends Clutter.LayoutManager {
    static {
        GObject.registerClass(this);
    }

    vfunc_get_preferred_width() {
        return [0, 0];
    }

    vfunc_get_preferred_height() {
        return [0, 0];
    }

    vfunc_allocate(container, box) {
        const monitor = Main.layoutManager.findIndexForActor(container);
        const workArea = Main.layoutManager.getWorkAreaForMonitor(monitor);
        const hscale = box.get_width() / workArea.width;
        const vscale = box.get_height() / workArea.height;

        for (const child of container) {
            const childBox = new Clutter.ActorBox();
            const frameRect = child.metaWindow.get_frame_rect();
            childBox.set_size(
                Math.round(Math.min(frameRect.width, workArea.width) * hscale),
                Math.round(Math.min(frameRect.height, workArea.height) * vscale));
            childBox.set_origin(
                Math.round((frameRect.x - workArea.x) * hscale),
                Math.round((frameRect.y - workArea.y) * vscale));
            child.allocate(childBox);
        }
    }
}

class WorkspaceThumbnail extends St.Button {
    static [GObject.properties] = {
        'active': GObject.ParamSpec.boolean(
            'active', null, null,
            GObject.ParamFlags.READWRITE,
            false),
    };

    static {
        GObject.registerClass(this);
    }

    constructor(index) {
        super();

        const box = new St.BoxLayout({
            style_class: 'workspace-box',
            y_expand: true,
            orientation: Clutter.Orientation.VERTICAL,
        });
        this.set_child(box);

        this._preview = new St.Bin({
            style_class: 'workspace',
            child: new Clutter.Actor({
                layout_manager: new WorkspaceLayout(),
                clip_to_allocation: true,
                x_expand: true,
                y_expand: true,
            }),
            y_expand: true,
        });
        box.add_child(this._preview);

        this._tooltip = new St.Label({
            style_class: 'dash-label',
            visible: false,
        });
        Main.uiGroup.add_child(this._tooltip);

        this.connect('destroy', this._onDestroy.bind(this));
        this.connect('notify::hover', this._syncTooltip.bind(this));

        this._index = index;
        this._delegate = this; // needed for DND

        this._windowPreviews = new Map();

        const workspaceManager = global.workspace_manager;
        this._workspace = workspaceManager.get_workspace_by_index(index);

        this._workspace.bind_property('active',
            this, 'active',
            GObject.BindingFlags.SYNC_CREATE);

        this._workspace.connectObject(
            'window-added', (ws, window) => this._addWindow(window),
            'window-removed', (ws, window) => this._removeWindow(window),
            this);

        global.display.connectObject('restacked',
            this._onRestacked.bind(this), this);

        this._workspace.list_windows().forEach(w => this._addWindow(w));
        this._onRestacked();
    }

    get active() {
        return this._preview.has_style_class_name('active');
    }

    set active(active) {
        if (active)
            this._preview.add_style_class_name('active');
        else
            this._preview.remove_style_class_name('active');
        this.notify('active');
    }

    acceptDrop(source) {
        if (!source.metaWindow)
            return false;

        this._moveWindow(source.metaWindow);
        return true;
    }

    handleDragOver(source) {
        if (source.metaWindow)
            return DND.DragMotionResult.MOVE_DROP;
        else
            return DND.DragMotionResult.CONTINUE;
    }

    _addWindow(window) {
        if (this._windowPreviews.has(window))
            return;

        const preview = new WindowPreview(window);
        preview.connect('clicked', (a, btn) => this.emit('clicked', btn));
        this._windowPreviews.set(window, preview);
        this._preview.child.add_child(preview);
    }

    _removeWindow(window) {
        const preview = this._windowPreviews.get(window);
        if (!preview)
            return;

        this._windowPreviews.delete(window);
        preview.destroy();
    }

    _onRestacked() {
        let lastPreview = null;
        const windows = global.get_window_actors().map(a => a.meta_window);
        for (let i = 0; i < windows.length; i++) {
            const preview = this._windowPreviews.get(windows[i]);
            if (!preview)
                continue;

            this._preview.child.set_child_above_sibling(preview, lastPreview);
            lastPreview = preview;
        }
    }

    _moveWindow(window) {
        const monitorIndex = Main.layoutManager.findIndexForActor(this);
        if (monitorIndex !== window.get_monitor())
            window.move_to_monitor(monitorIndex);
        window.change_workspace_by_index(this._index, false);
    }

    on_clicked() {
        const ws = global.workspace_manager.get_workspace_by_index(this._index);
        if (ws)
            ws.activate(global.get_current_time());
    }

    _syncTooltip() {
        if (this.hover) {
            this._tooltip.set({
                text: Meta.prefs_get_workspace_name(this._index),
                visible: true,
                opacity: 0,
            });

            const [stageX, stageY] = this.get_transformed_position();
            const [thumbWidth, thumbHeight] = this.allocation.get_size();
            const [tipWidth, tipHeight] = this._tooltip.get_size();
            const xOffset = Math.floor((thumbWidth - tipWidth) / 2);
            const monitor = Main.layoutManager.findMonitorForActor(this);
            const x = Math.clamp(
                stageX + xOffset,
                monitor.x,
                monitor.x + monitor.width - tipWidth);
            const y = stageY - monitor.y > thumbHeight + TOOLTIP_OFFSET
                ? stageY - tipHeight - TOOLTIP_OFFSET // show above
                : stageY + thumbHeight + TOOLTIP_OFFSET; // show below
            this._tooltip.set_position(x, y);
        }

        this._tooltip.ease({
            opacity: this.hover ? 255 : 0,
            duration: TOOLTIP_ANIMATION_TIME,
            mode: Clutter.AnimationMode.EASE_OUT_QUAD,
            onComplete: () => (this._tooltip.visible = this.hover),
        });
    }

    _onDestroy() {
        this._tooltip.destroy();
    }
}

class WorkspacePreviews extends Clutter.Actor {
    static {
        GObject.registerClass(this);
    }

    constructor(params) {
        super({
            ...params,
            layout_manager: new Clutter.BinLayout(),
            reactive: true,
            y_expand: true,
        });

        this.connect('scroll-event',
            (a, event) => Main.wm.handleWorkspaceScroll(event));

        const {workspaceManager} = global;

        workspaceManager.connectObject(
            'notify::n-workspaces', () => this._updateThumbnails(), GObject.ConnectFlags.AFTER,
            'workspace-switched', () => this._updateScrollPosition(),
            this);

        this.connect('notify::mapped', () => {
            if (this.mapped)
                this._updateScrollPosition();
        });

        this._thumbnailsBox = new St.BoxLayout({
            style_class: 'workspaces-box',
            y_expand: true,
        });

        this._scrollView = new St.ScrollView({
            style_class: 'workspaces-view hfade',
            enable_mouse_scrolling: false,
            hscrollbar_policy: St.PolicyType.EXTERNAL,
            vscrollbar_policy: St.PolicyType.NEVER,
            y_expand: true,
            child: this._thumbnailsBox,
        });

        this.add_child(this._scrollView);

        this._updateThumbnails();
    }

    _updateThumbnails() {
        const {nWorkspaces} = global.workspace_manager;

        this._thumbnailsBox.destroy_all_children();

        for (let i = 0; i < nWorkspaces; i++)
            this._thumbnailsBox.add_child(new WorkspaceThumbnail(i));

        if (this.mapped)
            this._updateScrollPosition();
    }

    _updateScrollPosition() {
        const adjustment = this._scrollView.hadjustment;
        const {upper, pageSize} = adjustment;
        let {value} = adjustment;

        const activeWorkspace =
            [...this._thumbnailsBox].find(a => a.active);

        if (!activeWorkspace)
            return;

        let offset = 0;
        const hfade = this._scrollView.get_effect('fade');
        if (hfade)
            offset = hfade.fade_margins.left;

        let {x1, x2} = activeWorkspace.get_allocation_box();
        let parent = activeWorkspace.get_parent();
        while (parent !== this._scrollView) {
            if (!parent)
                throw new Error('actor not in scroll view');

            const box = parent.get_allocation_box();
            x1 += box.x1;
            x2 += box.x1;
            parent = parent.get_parent();
        }

        if (x1 < value + offset)
            value = Math.max(0, x1 - offset);
        else if (x2 > value + pageSize - offset)
            value = Math.min(upper, x2 + offset - pageSize);
        else
            return;

        adjustment.ease(value, {
            mode: Clutter.AnimationMode.EASE_OUT_QUAD,
            duration: SCROLL_TIME,
        });
    }
}

class EditableMenuItem extends PopupMenu.PopupBaseMenuItem {
    static [GObject.signals] = {
        'edited': {},
    };

    static {
        GObject.registerClass(this);
    }

    constructor() {
        super({
            style_class: 'editable-menu-item',
        });
        this.get_accessible()?.set_description(
            _('Press %s to edit').format('e'));

        const stack = new Shell.Stack({
            x_expand: true,
            x_align: Clutter.ActorAlign.START,
        });
        this.add_child(stack);

        this.label = new St.Label({
            y_align: Clutter.ActorAlign.CENTER,
        });
        stack.add_child(this.label);
        this.label_actor = this.label;

        this._entry = new St.Entry({
            opacity: 0,
            visible: false,
        });
        stack.add_child(this._entry);

        this.label.bind_property('text',
            this._entry, 'text',
            GObject.BindingFlags.DEFAULT);

        this._entry.clutter_text.connect('activate',
            () => this._stopEditing());

        this._editButton = new St.Button({
            style_class: 'icon-button flat',
            icon_name: 'document-edit-symbolic',
            button_mask: St.ButtonMask.ONE,
            toggle_mode: true,
            x_align: Clutter.ActorAlign.END,
            y_align: Clutter.ActorAlign.CENTER,
        });
        this.add_child(this._editButton);

        this._editButton.connect('notify::checked', () => {
            if (this._editButton.checked) {
                this._editButton.icon_name = 'ornament-check-symbolic';
                this._startEditing();
            } else {
                this._editButton.icon_name = 'document-edit-symbolic';
                this._stopEditing();
            }
        });
        this.connect('key-release-event', (o, event) => {
            if (event.get_key_symbol() !== Clutter.KEY_e)
                return Clutter.EVENT_PROPAGATE;

            if (this._editButton.checked)
                return Clutter.EVENT_PROPAGATE;

            this._editButton.checked = true;
            return Clutter.EVENT_STOP;
        });

        global.stage.connectObject('notify::key-focus', () => {
            const {keyFocus} = global.stage;
            if (!keyFocus || !this.contains(keyFocus))
                this._stopEditing();
        }, this);
    }

    _switchActor(from, to) {
        to.visible = from.visible = true;
        to.ease({
            opacity: 255,
            duration: 300,
            mode: Clutter.AnimationMode.EASE_OUT_QUAD,
        });

        from.ease({
            opacity: 0,
            duration: 300,
            mode: Clutter.AnimationMode.EASE_OUT_QUAD,
            onComplete: () => {
                from.visible = false;
            },
        });
    }

    _startEditing() {
        this._switchActor(this.label, this._entry);

        this._entry.clutter_text.set_selection(0, -1);
        this._entry.clutter_text.grab_key_focus();
    }

    _stopEditing() {
        if (this.label.text !== this._entry.text) {
            this.label.text = this._entry.text;
            this.emit('edited');
        }

        if (this._editButton.checked)
            this._editButton.checked = false;

        this._switchActor(this._entry, this.label);
        this.navigate_focus(this, St.DirectionType.TAB_FORWARD, false);
    }
}

class WorkspacesMenu extends PopupMenu.PopupMenu {
    constructor(sourceActor, extension) {
        super(sourceActor, 0.5, St.Side.TOP);

        this.actor.add_style_class_name(`${baseStyleClassName}-menu`);

        this._workspacesSection = new PopupMenu.PopupMenuSection();

        // make the section scrollable to avoid growing indefinitely
        const scrollView = new St.ScrollView({
            style_class: 'vfade',
            child: this._workspacesSection.box,
        });
        scrollView._delegate = this._workspacesSection;
        this._workspacesSection.actor = scrollView;

        this.addMenuItem(this._workspacesSection);

        this.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        this.addAction(_('Settings'), () => {
            extension.openPreferences();
        });

        this._desktopSettings =
            new Gio.Settings({schema_id: 'org.gnome.desktop.wm.preferences'});
        this._desktopSettings.connectObject('changed::workspace-names', () => {
            this._updateWorkspaceLabels();
            this.emit('active-name-changed');
        }, this);

        const {workspaceManager} = global;
        workspaceManager.connectObject(
            'notify::n-workspaces', () => this._updateWorkspaceItems(),
            'workspace-switched', () => this._updateActiveIndicator(),
            this.actor);
        this._updateWorkspaceItems();
    }

    get activeName() {
        const {workspaceManager} = global;
        const active = workspaceManager.get_active_workspace_index();
        return Meta.prefs_get_workspace_name(active);
    }

    _updateWorkspaceItems() {
        const {workspaceManager} = global;
        const {nWorkspaces} = workspaceManager;

        const section = this._workspacesSection.box;
        while (section.get_n_children() < nWorkspaces) {
            const item = new EditableMenuItem();
            item.connect('activate', (o, event) => {
                const index = [...section].indexOf(item);
                const workspace = workspaceManager.get_workspace_by_index(index);
                workspace?.activate(event.get_time());
            });
            item.connect('edited', () => {
                const nLabels = section.get_n_children();
                const oldNames = this._desktopSettings.get_strv('workspace-names');
                const newNames = [...section].map(c => c.label.text);
                this._desktopSettings.set_strv('workspace-names',
                    [...newNames, ...oldNames.slice(nLabels)]);
            });
            item.connect('notify::active', () => {
                const view = this._workspacesSection.actor;
                if (item.active)
                    ensureActorVisibleInScrollView(view, item);
            });
            this._workspacesSection.addMenuItem(item);
        }

        [...section].splice(nWorkspaces).forEach(item => item.destroy());

        this._updateWorkspaceLabels();
        this._updateActiveIndicator();
    }

    _updateWorkspaceLabels() {
        const items = [...this._workspacesSection.box];
        items.forEach(
            (item, i) => (item.label.text = Meta.prefs_get_workspace_name(i)));
    }

    _updateActiveIndicator() {
        const {workspaceManager} = global;
        const active = workspaceManager.get_active_workspace_index();

        const items = [...this._workspacesSection.box];
        items.forEach((item, i) => {
            item.setOrnament(i === active
                ? PopupMenu.Ornament.CHECK
                : PopupMenu.Ornament.NONE);
        });
        this.emit('active-name-changed');
    }
}

export class WorkspaceIndicator extends PanelMenu.Button {
    static {
        GObject.registerClass(this);
    }

    constructor(params = {}) {
        super(0.5, _('Workspace Indicator'), true);

        const {
            baseStyleClass = 'workspace-indicator',
            extension,
        } = params;

        this._settings = extension.getSettings();

        baseStyleClassName = baseStyleClass;
        this.add_style_class_name(baseStyleClassName);

        this.setMenu(new WorkspacesMenu(this, extension));

        const container = new St.Widget({
            layout_manager: new Clutter.BinLayout(),
            x_expand: true,
            y_expand: true,
        });
        this.add_child(container);

        this._statusBox = new St.BoxLayout();
        container.add_child(this._statusBox);

        const wm = global.workspace_manager;

        this._statusLabel = new St.Label({
            style_class: 'status-label',
            x_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
            text: `${wm.get_active_workspace_index() + 1} / ${wm.n_workspaces}`,
        });
        this._statusBox.add_child(this._statusLabel);
        // this._statusBox.add_child(new St.Icon({
        //     icon_name: 'pan-down-symbolic',
        //     style_class: 'system-status-icon',
        // }));

        this.menu.connect('active-name-changed', () => {
            const wm = global.workspace_manager;
            this._statusLabel.set_text(
                `${wm.get_active_workspace_index() + 1} / ${wm.n_workspaces}`
            );
        });

        this._thumbnails = new WorkspacePreviews();
        container.add_child(this._thumbnails);

        this._thumbnails.connect('button-press-event', (a, event) => {
            if (event.get_button() !== Clutter.BUTTON_SECONDARY)
                return Clutter.EVENT_PROPAGATE;

            this.menu.toggle();
            return Clutter.EVENT_STOP;
        });

        this.connect('scroll-event',
            (a, event) => Main.wm.handleWorkspaceScroll(event));

        this._inTopBar = false;
        this.connect('notify::realized', () => {
            if (!this.realized)
                return;

            this._inTopBar = Main.panel.contains(this);
            this._updateTopBarRedirect();
        });

        this._settings.connect('changed::embed-previews',
            () => this._updateThumbnailVisibility());
        this._updateThumbnailVisibility();
    }

    _onDestroy() {
        if (this._inTopBar)
            Main.panel.set_offscreen_redirect(Clutter.OffscreenRedirect.ALWAYS);
        this._inTopBar = false;

        super._onDestroy();
    }

    _updateThumbnailVisibility() {
        const usePreviews = this._settings.get_boolean('embed-previews');
        this.reactive = !usePreviews;

        this._thumbnails.visible = usePreviews;
        this._statusBox.visible = !usePreviews;

        if (usePreviews) {
            this.add_style_class_name('previews');
            this.remove_style_class_name('name-label');
        } else {
            this.remove_style_class_name('previews');
            this.add_style_class_name('name-label');
        }

        this._updateTopBarRedirect();
    }

    _updateTopBarRedirect() {
        if (!this._inTopBar)
            return;

        // Disable offscreen-redirect when showing the workspace switcher
        // so that clip-to-allocation works
        Main.panel.set_offscreen_redirect(this._thumbnails.visible
            ? Clutter.OffscreenRedirect.ALWAYS
            : Clutter.OffscreenRedirect.AUTOMATIC_FOR_OPACITY);
    }
}
