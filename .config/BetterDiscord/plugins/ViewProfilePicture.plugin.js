/**
 * @name ViewProfilePicture
 * @description Adds a button to the user popout and profile that allows you to view the Avatar and banner.
 * @version 1.3.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/ViewProfilePicture
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/ViewProfilePicture/ViewProfilePicture.plugin.js
 */

// common/Utils/EventEmitter.js
var EventEmitter_default = class {
	constructor() {
		this.listeners = {};
	}
	isInValid(event, handler) {
		return typeof event !== "string" || typeof handler !== "function";
	}
	once(event, handler) {
		if (this.isInValid(event, handler)) return;
		if (!this.listeners[event]) this.listeners[event] = /* @__PURE__ */ new Set();
		const wrapper = () => {
			handler();
			this.off(event, wrapper);
		};
		this.listeners[event].add(wrapper);
	}
	on(event, handler) {
		if (this.isInValid(event, handler)) return;
		if (!this.listeners[event]) this.listeners[event] = /* @__PURE__ */ new Set();
		this.listeners[event].add(handler);
		return () => this.off(event, handler);
	}
	off(event, handler) {
		if (this.isInValid(event, handler)) return;
		if (!this.listeners[event]) return;
		this.listeners[event].delete(handler);
		if (this.listeners[event].size !== 0) return;
		delete this.listeners[event];
	}
	emit(event, ...payload) {
		if (!this.listeners[event]) return;
		for (const listener of this.listeners[event]) {
			try {
				listener.apply(null, payload);
			} catch (err) {
				console.error(`Could not run listener for ${event}`, err);
			}
		}
	}
};

// common/Utils/Plugin.js
var Events = {
	START: "START",
	STOP: "STOP"
};
var Plugin_default = new class extends EventEmitter_default {
	start() {
		this.emit(Events.START);
	}
	stop() {
		this.emit(Events.STOP);
	}
}();

// config:@Config
var Config_default = {
	"info": {
		"name": "ViewProfilePicture",
		"version": "1.3.0",
		"description": "Adds a button to the user popout and profile that allows you to view the Avatar and banner.",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/ViewProfilePicture/ViewProfilePicture.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/ViewProfilePicture",
		"authors": [{
			"name": "Skamt"
		}]
	},
	"settings": {
		"showOnHover": false,
		"bannerColor": false
	}
};

// common/Api.js
var Api = new BdApi(Config_default.info.name);
var UI = /* @__PURE__ */ (() => Api.UI)();
var DOM = /* @__PURE__ */ (() => Api.DOM)();
var Data = /* @__PURE__ */ (() => Api.Data)();
var React = /* @__PURE__ */ (() => Api.React)();
var Patcher = /* @__PURE__ */ (() => Api.Patcher)();
var Logger = /* @__PURE__ */ (() => Api.Logger)();
var Webpack = /* @__PURE__ */ (() => Api.Webpack)();
var findInTree = /* @__PURE__ */ (() => Api.Utils.findInTree)();

// common/Utils/StylesLoader.js
var styleLoader = {
	_styles: [],
	push(styles) {
		this._styles.push(styles);
	}
};
Plugin_default.on(Events.START, () => {
	DOM.addStyle(styleLoader._styles.join("\n"));
});
Plugin_default.on(Events.STOP, () => {
	DOM.removeStyle();
});
var StylesLoader_default = styleLoader;

// src/ViewProfilePicture/styles.css
StylesLoader_default.push(`/* View Profile Button */
.VPP-Button {
	background: hsl(var(--black-500-hsl) / 0.7);
	cursor: pointer;
	display: flex;
	border-radius: 50%;
	color: #fff;
	width: 32px;
	height: 32px;
	justify-content: center;
	align-items: center;
}

.VPP-float {
	position: absolute;
	top: 12px;
	right: 12px;
	z-index: 987;
}

.VPP-Button svg {
	height: 18px;
	width: 18px;
}

/* Bigger icon on profile */
.VPP-settings svg,
.VPP-profile svg {
	height: 24px;
	width: 24px;
}

.VPP-Button:hover {
	background: hsl(var(--black-500-hsl) / 0.85);
}

/* div replacement if No banner */
.VPP-NoBanner {
	width: 70vw;
	height: 50vh;
	position: relative;
}

/* Carousel Modal */
.VPP-carousel-modal {
	background: #0000;
	width: 100vw;
	height: 100vh;
	box-shadow: none !important;
}

.VPP-carousel {
	position: static;
	margin: auto;
}

.VPP-carousel button {
	margin: 0 15px;
	opacity: 0.8;
	background: var(--background-base-low);
	border-radius: 50%;
}

/* Copy color button */
.VPP-copy-color-container {
	position: absolute;
	top: 100%;
	display: flex;
	cursor: pointer;
	gap: 5px;
}

.VPP-copy-color-label,
.VPP-copy-color {
	font-size: 14px;
	font-weight: 500;
	color: #fff;
	line-height: 30px;
	transition: opacity 0.15s ease;
	opacity: 0.5;
	text-transform: uppercase;
}

.VPP-copy-color:hover {
	opacity: 1;
	text-decoration: underline;
}

.VPP-separator {
	line-height: 30px;
	opacity: 0.5;
	color: #fff;
}

.VPP-copy-color-label {
	text-transform: capitalize;
}

.VPP-hover {
	opacity: 0;
}

.VPP-container:hover .VPP-hover {
	opacity: 1;
}

.VPP-colorFormat-options {
	display: flex;
}

.VPP-colorFormat-options > div {
	flex: 1;
}
`);

// common/Utils/index.js
function fit({ width, height, gap = 0.8 }) {
	const ratio = Math.min(innerWidth / width, innerHeight / height);
	width = Math.round(width * ratio);
	height = Math.round(height * ratio);
	return {
		width,
		height,
		maxHeight: height * gap,
		maxWidth: width * gap
	};
}

function concateClassNames(...args) {
	return args.filter(Boolean).join(" ");
}
var promiseHandler = (promise) => promise.then((data) => [void 0, data]).catch((err) => [err]);

function copy(data) {
	DiscordNative.clipboard.copy(data);
}
var nop = () => {};

function getImageDimensions(url) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve({
			width: img.width,
			height: img.height
		});
		img.onerror = reject;
		img.src = url;
	});
}

// common/Components/ErrorBoundary/index.jsx
var ErrorBoundary = class extends React.Component {
	state = { hasError: false, error: null, info: null };
	componentDidCatch(error, info) {
		this.setState({ error, info, hasError: true });
		const errorMessage = `
	${error?.message || ""}${(info?.componentStack || "").split("\n").slice(0, 20).join("\n")}`;
		console.error(`%c[${Config_default?.info?.name || "Unknown Plugin"}] %cthrew an exception at %c[${this.props.id}]
`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;", errorMessage);
	}
	renderErrorBoundary() {
		return /* @__PURE__ */ React.createElement("div", { style: { background: "#292c2c", padding: "20px", borderRadius: "10px" } }, /* @__PURE__ */ React.createElement("b", { style: { color: "#e0e1e5" } }, "An error has occured while rendering ", /* @__PURE__ */ React.createElement("span", { style: { color: "orange" } }, this.props.id)));
	}
	renderFallback() {
		if (React.isValidElement(this.props.fallback)) {
			if (this.props.passMetaProps)
				this.props.fallback.props = {
					id: this.props.id,
					plugin: Config_default?.info?.name || "Unknown Plugin",
					...this.props.fallback.props
				};
			return this.props.fallback;
		}
		return /* @__PURE__ */ React.createElement(
			this.props.fallback, {
				id: this.props.id,
				plugin: Config_default?.info?.name || "Unknown Plugin"
			}
		);
	}
	render() {
		if (!this.state.hasError) return this.props.children;
		return this.props.fallback ? this.renderFallback() : this.renderErrorBoundary();
	}
};

// common/Components/icons/ErrorIcon/index.jsx
var ErrorIcon_default = (props) => /* @__PURE__ */ React.createElement("div", { ...props }, /* @__PURE__ */ React.createElement(
	"svg", {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		fill: "red",
		width: "18",
		height: "18"
	},
	/* @__PURE__ */
	React.createElement(
		"path", {
			d: "M0 0h24v24H0z",
			fill: "none"
		}
	),
	/* @__PURE__ */
	React.createElement("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" })
));

// common/Utils/Logger.js
Logger.patchError = (patchId) => {
	console.error(`%c[${Config_default.info.name}] %cCould not find module for %c[${patchId}]`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;");
};
var Logger_default = Logger;

// common/Webpack.js
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();

function reactRefMemoFilter(type, ...args) {
	const filter = Filters.byStrings(...args);
	return (target) => target[type] && filter(target[type]);
}

function getModuleAndKey(filter, options) {
	let module2;
	const target = getModule((entry, m) => filter(entry) ? module2 = m : false, options);
	module2 = module2?.exports;
	if (!module2) return;
	const key = Object.keys(module2).find((k) => module2[k] === target);
	if (!key) return;
	return { module: module2, key };
}

// common/React.js
var useState = /* @__PURE__ */ (() => React.useState)();
var useMemo = /* @__PURE__ */ (() => React.useMemo)();
var React_default = /* @__PURE__ */ (() => React)();

// common/DiscordModules/zustand.js
var { zustand } = getMangled(Filters.bySource("useSyncExternalStoreWithSelector", "useDebugValue", "subscribe"), {
	_: Filters.byStrings("subscribe"),
	zustand: () => true
});
var subscribeWithSelector = getModule(Filters.byStrings("equalityFn", "fireImmediately"), { searchExports: true });
var zustand_default = zustand;

// common/Utils/Settings.js
var SettingsStoreSelectors = {};
var persistMiddleware = (config) => (set, get, api) => config((args) => (set(args), Data.save("settings", get().getRawState())), get, api);
var SettingsStore = Object.assign(
	zustand_default(
		persistMiddleware(
			subscribeWithSelector((set, get) => {
				const settingsObj = /* @__PURE__ */ Object.create(null);
				for (const [key, value] of Object.entries({
						...Config_default.settings,
						...Data.load("settings")
					})) {
					settingsObj[key] = value;
					settingsObj[`set${key}`] = (newValue) => set({
						[key]: newValue });
					SettingsStoreSelectors[key] = (state) => state[key];
				}
				settingsObj.getRawState = () => {
					return Object.entries(get()).filter(([, val]) => typeof val !== "function").reduce((acc, [key, val]) => {
						acc[key] = val;
						return acc;
					}, {});
				};
				return settingsObj;
			})
		)
	), {
		useSetting: function(key) {
			return this((state) => [state[key], state[`set${key}`]]);
		},
		selectors: SettingsStoreSelectors
	}
);
Object.defineProperty(SettingsStore, "state", {
	configurable: false,
	get() {
		return this.getState();
	}
});
var Settings_default = SettingsStore;

// common/Utils/Modals/styles.css
StylesLoader_default.push(`.transparent-background.transparent-background{
	background: transparent;
	border:unset;
}`);

// MODULES-AUTO-LOADER:@Modules/ModalRoot
var ModalRoot_default = getModule(Filters.byStrings("rootWithShadow", "MODAL"), { searchExports: true });

// MODULES-AUTO-LOADER:@Modules/ModalSize
var ModalSize_default = getModule(Filters.byKeys("DYNAMIC", "SMALL", "LARGE"), { searchExports: true });

// common/Utils/Modals/index.jsx
var ModalActions = /* @__PURE__ */ getMangled("onCloseRequest:null!=", {
	openModal: /* @__PURE__ */ Filters.byStrings("onCloseRequest:null!="),
	closeModal: /* @__PURE__ */ Filters.byStrings(".setState", ".getState()[")
});
var openModal = (children, tag, { className, ...modalRootProps } = {}) => {
	const id = `${tag ? `${tag}-` : ""}modal`;
	return ModalActions.openModal((props) => {
		return /* @__PURE__ */ React.createElement(
			ErrorBoundary, {
				id,
				plugin: Config_default.info.name
			},
			/* @__PURE__ */
			React.createElement(
				ModalRoot_default, {
					onClick: props.onClose,
					transitionState: props.transitionState,
					className: concateClassNames("transparent-background", className),
					size: ModalSize_default.DYNAMIC,
					...modalRootProps
				},
				React.cloneElement(children, { ...props })
			)
		);
	});
};

// MODULES-AUTO-LOADER:@Modules/Tooltip
var Tooltip_default = getModule(Filters.byPrototypeKeys("renderTooltip"), { searchExports: true });

// common/Components/Tooltip/index.jsx
var Tooltip_default2 = ({ note, position, children }) => {
	return /* @__PURE__ */ React.createElement(
		Tooltip_default, {
			text: note,
			position: position || "top"
		},
		(props) => React.cloneElement(children, {
			...props,
			...children.props
		})
	);
};

// common/Components/icons/ImageIcon/index.jsx
function ImageIcon(props) {
	return /* @__PURE__ */ React.createElement(
		"svg", {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "-50 -50 484 484",
			...props
		},
		/* @__PURE__ */
		React.createElement("path", { d: "M341.333,0H42.667C19.093,0,0,19.093,0,42.667v298.667C0,364.907,19.093,384,42.667,384h298.667 C364.907,384,384,364.907,384,341.333V42.667C384,19.093,364.907,0,341.333,0z M42.667,320l74.667-96l53.333,64.107L245.333,192l96,128H42.667z" })
	);
}

// common/Utils/ImageModal/styles.css
StylesLoader_default.push(`.downloadLink {
	color: white !important;
	font-size: 14px;
	font-weight: 500;
	/*	line-height: 18px;*/
	text-decoration: none;
	transition: opacity.15s ease;
	opacity: 0.5;
}

.imageModalwrapper {
	display: flex;
	flex-direction: column;
}

.imageModalOptions {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 4px;
}
`);

// MODULES-AUTO-LOADER:@Stores/AccessibilityStore
var AccessibilityStore_default = getStore("AccessibilityStore");

// common/Utils/ImageModal/index.jsx
var RenderLinkComponent = getModule((m) => m.type?.toString?.().includes("MASKED_LINK"), { searchExports: false });
var ImageModal = getModule(reactRefMemoFilter("type", "renderLinkComponent"), { searchExports: true });

function h(e, t) {
	let n = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
	true === n || AccessibilityStore_default.useReducedMotion ? e.set(t) : e.start(t);
}
var useSomeScalingHook = getModule(Filters.byStrings("reducedMotion.enabled", "useSpring", "respect-motion-settings"), { searchExports: true });
var context = getModule((a) => a?._currentValue?.scale, { searchExports: true });
var ImageComponent = ({ url, ...rest }) => {
	const [x, P] = useState(false);
	const [M, w] = useSomeScalingHook(() => ({
		scale: AccessibilityStore_default.useReducedMotion ? 1 : 0.9,
		x: 0,
		y: 0,
		config: {
			friction: 30,
			tension: 300
		}
	}));
	const contextVal = useMemo(
		() => ({
			scale: M.scale,
			x: M.x,
			y: M.y,
			setScale(e, t) {
				h(M.scale, e, null == t ? void 0 : t.immediate);
			},
			setOffset(e, t, n) {
				h(M.x, e, null == n ? void 0 : n.immediate), h(M.y, t, null == n ? void 0 : n.immediate);
			},
			zoomed: x,
			setZoomed(e) {
				P(e), h(M.scale, e ? 2.5 : 1), e || (h(M.x, 0), h(M.y, 0));
			}
		}),
		[x, M]
	);
	return /* @__PURE__ */ React_default.createElement(context.Provider, { value: contextVal }, /* @__PURE__ */ React_default.createElement("div", { className: "imageModalwrapper" }, /* @__PURE__ */ React_default.createElement(
		ImageModal, {
			maxWidth: rest.maxWidth,
			maxHeight: rest.maxHeight,
			media: {
				...rest,
				type: "IMAGE",
				url,
				proxyUrl: url
			}
		}
	), !x && /* @__PURE__ */ React_default.createElement("div", { className: "imageModalOptions" }, /* @__PURE__ */ React_default.createElement(
		RenderLinkComponent, {
			className: "downloadLink",
			href: url
		},
		"Open in Browser"
	))));
};

// MODULES-AUTO-LOADER:@Modules/Color
var Color_default = getModule(Filters.byKeys("Color", "hex", "hsl"), { searchExports: false });

// MODULES-AUTO-LOADER:@Stores/ThemeStore
var ThemeStore_default = getStore("ThemeStore");

// common/Utils/Toast.js
function showToast(content, type) {
	UI.showToast(`[${Config_default.info.name}] ${content}`, { timeout: 5e3, type });
}
var Toast_default = {
	success(content) {
		showToast(content, "success");
	},
	info(content) {
		showToast(content, "info");
	},
	warning(content) {
		showToast(content, "warning");
	},
	error(content) {
		showToast(content, "error");
	}
};

// src/ViewProfilePicture/components/ColorModalComponent.jsx
var DesignSystem = getModule((a) => a?.unsafe_rawColors?.PRIMARY_800?.resolve);

function resolveColor() {
	if (!DesignSystem?.unsafe_rawColors?.PRIMARY_800) return "#111214";
	return DesignSystem.unsafe_rawColors?.PRIMARY_800.resolve({
		theme: ThemeStore_default.theme,
		saturation: AccessibilityStore_default.saturation
	}).hex();
}

function copyColor(type, color) {
	let c = color;
	try {
		switch (type) {
			case "hex":
				c = Color_default(color).hex();
				break;
			case "rgba":
				c = Color_default(color).css("rgba");
				break;
			case "hsla":
				c = Color_default(color).css("hsla");
				break;
		}
	} finally {
		copy(c);
		Toast_default.success(`${c} Copied!`);
	}
}

function SimpleColorModal({ color }) {
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			onClick: (e) => e.stopPropagation(),
			className: "VPP-NoBanner",
			style: { backgroundColor: Color_default(color).css() }
		},
		/* @__PURE__ */
		React_default.createElement("div", { className: "VPP-copy-color-container" }, /* @__PURE__ */ React_default.createElement("span", { className: "VPP-copy-color-label" }, "Copy Color:"), ["hex", false, "rgba", false, "hsla"].map(
			(name) => name ? /* @__PURE__ */ React_default.createElement(
				"a", {
					className: "VPP-copy-color",
					onClick: (e) => {
						e.stopPropagation();
						copyColor(name, color);
					}
				},
				name
			) : /* @__PURE__ */ React_default.createElement("span", { className: "VPP-separator" }, "|")
		))
	);
}
var {
	module: { ZP: palletHook }
} = getModuleAndKey(Filters.byStrings("toHexString", "toHsl", "palette"), { searchExports: true }) || {};

function ColorModal({ displayProfile, user }) {
	const color = palletHook(user.getAvatarURL(displayProfile.guildId, 80));
	return /* @__PURE__ */ React_default.createElement(SimpleColorModal, { color: color || resolveColor() });
}
var ColorModalComponent_default = {
	SimpleColorModal,
	ColorModal
};

// MODULES-AUTO-LOADER:@Modules/ModalCarousel
var ModalCarousel_default = getModule(Filters.byPrototypeKeys("navigateTo", "preloadImage"), { searchExports: false });

// src/ViewProfilePicture/components/ModalCarousel.jsx
var ModalCarousel_default2 = class extends ModalCarousel_default {
	preloadNextImages() {}
};

// MODULES-AUTO-LOADER:@Modules/Spinner
var Spinner_default = getModule((a) => a?.Type?.CHASING_DOTS, { searchExports: true });

// src/ViewProfilePicture/components/ViewProfilePictureButtonComponent.jsx
function Banner({ url, src }) {
	const [loaded, setLoaded] = React_default.useState(false);
	const dimsRef = React_default.useRef();
	React_default.useEffect(() => {
		(async () => {
			const [err, dims] = await promiseHandler(getImageDimensions(src));
			dimsRef.current = fit(err ? {} : dims);
			setLoaded(true);
		})();
	}, []);
	if (!loaded) return /* @__PURE__ */ React_default.createElement(Spinner_default, { type: Spinner_default.Type.SPINNING_CIRCLE });
	return /* @__PURE__ */ React_default.createElement(
		ImageComponent, {
			url,
			...dimsRef.current
		}
	);
}
var ViewProfilePictureButtonComponent_default = ({ className, user, displayProfile }) => {
	const showOnHover = Settings_default(Settings_default.selectors.showOnHover);
	const handler = () => {
		const avatarURL = user.getAvatarURL(displayProfile.guildId, 4096, true);
		const bannerURL = displayProfile.getBannerURL({ canAnimate: true, size: 4096 });
		const color = displayProfile.accentColor || displayProfile.primaryColor;
		const items = [
			/* @__PURE__ */
			React_default.createElement(
				ImageComponent, {
					url: avatarURL,
					...fit({ width: 4096, height: 4096 })
				}
			),
			bannerURL && /* @__PURE__ */ React_default.createElement(
				Banner, {
					url: bannerURL,
					src: displayProfile.getBannerURL({ canAnimate: true, size: 20 })
				}
			),
			(!bannerURL || Settings_default.getState().bannerColor) && (color ? /* @__PURE__ */ React_default.createElement(ColorModalComponent_default.SimpleColorModal, { color }) : /* @__PURE__ */ React_default.createElement(
				ColorModalComponent_default.ColorModal, {
					user,
					displayProfile
				}
			))
		].filter(Boolean).map((item) => ({ component: item }));
		openModal(
			/* @__PURE__ */
			React_default.createElement(
				ModalCarousel_default2, {
					startWith: 0,
					className: "VPP-carousel",
					items
				}
			),
			"VPP-carousel", { className: "VPP-carousel-modal" }
		);
	};
	return /* @__PURE__ */ React_default.createElement(Tooltip_default2, { note: "View profile picture" }, /* @__PURE__ */ React_default.createElement(
		"div", {
			onClick: handler,
			className: concateClassNames(className, showOnHover && "VPP-hover")
		},
		/* @__PURE__ */
		React_default.createElement(ImageIcon, null)
	));
};

// src/ViewProfilePicture/patches/patchVPPButton.jsx
var UserProfileModalforwardRef = getModule(Filters.byKeys("Overlay", "render"));
var typeFilter = Filters.byStrings("div", "wrapper", "children");
Plugin_default.on(Events.START, () => {
	if (!UserProfileModalforwardRef) return Logger_default.patchError("patchVPPButton");
	const unpatch = Patcher.after(UserProfileModalforwardRef, "render", (_, [props], ret) => {
		const target = findInTree(ret, (a) => typeFilter(a?.type), { walkable: ["props", "children"] }) || findInTree(ret, (a) => a?.type === "header" || a?.props?.className?.startsWith("profileHeader"), { walkable: ["props", "children"] });
		if (!target) return;
		ret.props.className = `${ret.props.className} VPP-container`;
		target.props.children.unshift(
			/* @__PURE__ */
			React.createElement(
				ErrorBoundary, {
					id: "ViewProfilePictureButtonComponent",
					plugin: Config_default.info.name,
					fallback: /* @__PURE__ */ React.createElement(ErrorIcon_default, { className: "VPP-Button" })
				},
				/* @__PURE__ */
				React.createElement(
					ViewProfilePictureButtonComponent_default, {
						className: concateClassNames("VPP-Button", !typeFilter(target?.type) && "VPP-float"),
						user: props.user,
						displayProfile: props.displayProfile
					}
				)
			)
		);
	});
	Plugin_default.once(Events.STOP, unpatch);
});

// MODULES-AUTO-LOADER:@Modules/FormSwitch
var FormSwitch_default = getModule(Filters.byStrings("note", "tooltipNote"), { searchExports: true });

// common/Components/Switch/index.jsx
var Switch_default = FormSwitch_default || function SwitchComponentFallback(props) {
	return /* @__PURE__ */ React.createElement("div", { style: { color: "#fff" } }, props.children, /* @__PURE__ */ React.createElement(
		"input", {
			type: "checkbox",
			checked: props.value,
			onChange: (e) => props.onChange(e.target.checked)
		}
	));
};

// common/Components/SettingSwtich/index.jsx
function SettingSwtich({ settingKey, note, onChange = nop, hideBorder = false, description, ...rest }) {
	const [val, set] = Settings_default.useSetting(settingKey);
	return /* @__PURE__ */ React.createElement(
		Switch_default, {
			...rest,
			value: val,
			note,
			hideBorder,
			onChange: (e) => {
				set(e);
				onChange(e);
			}
		},
		description || settingKey
	);
}

// src/ViewProfilePicture/components/SettingComponent.jsx
function SettingComponent() {
	return [{
			settingKey: "showOnHover",
			note: "By default hide ViewProfilePicture button and show on hover.",
			description: "Show on hover"
		},
		{
			settingKey: "bannerColor",
			note: "Always include banner color in carousel, even if a banner is present.",
			description: "Include banner color."
		}
	].map(SettingSwtich);
}

// src/ViewProfilePicture/index.jsx
Plugin_default.getSettingsPanel = () => /* @__PURE__ */ React_default.createElement(SettingComponent, null);
module.exports = () => Plugin_default;
