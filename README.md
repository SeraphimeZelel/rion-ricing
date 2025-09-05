# rion-ricing
Hey quick overview here. 

# Extension

These are the GNOME Shell extensions I use. The table below shows the extension name, what it does, and a short note or recommended configuration.

| Extension | Purpose / Usage | Notes / Recommended Settings |
|---|---|---|
| **Blur My Shell** | Adds configurable blur to GNOME Shell surfaces (top bar, overview, dialogs). | Tweak blur strength in the extension settings. May increase GPU usage slightly. |
| **Clipboard Indicator** | Simple clipboard manager accessible from the top bar; shows history and lets you pin/clear entries. | Set history size and enable/disable syncing to avoid leaking sensitive clipboard items. |
| **Just Perfection** | Powerful UI customizer for GNOME Shell (hide panel items, tweak overview, clock, etc.). | Backup configuration before big changes; useful to hide elements you don’t need. |
| **Media Controls** | Improves media playback controls in the top bar (MPRIS integration). | Works with most music/video players; enable show/hide behavior in prefs. |
| **Quick Settings Tweaks** | Adds extra toggles and small UI tweaks to the quick settings (system menu). | Choose which quick toggles you want; some toggles require additional packages. |
| **System Monitor** | Shows CPU, memory, disk or network stats in the top bar or quick settings. | Shows your vitals in top panel |
| **Unblank Lock Screen** | Prevents the lock screen from fully blanking (keeps wallpaper or UI visible). | Useful for demos/screenshots — be mindful of security / screen privacy. |
| **Workspace Indicator** | Displays current workspace information (number or name) on the top bar. | Handy for multi-workspace workflow; configure numbering vs names in prefs. |
| **Move Workspace Indicator** | Adds quick controls/indicators to move windows between workspaces. | Lets you move workspace indicator to the left (Enable the workspace indicator first) |
| **Open Bar** | Adds an extra customizable bar/dock for quick access to apps and widgets. | ⚠️ **Warning:** may cause a small lag when changing wallpaper (the extension redraws UI). If you notice stutter while switching wallpapers, try disabling Open Bar |

# Scripts

These are the custom scripts I use to integrate Pywal, wallpapers, and my applications.  

| Script | Purpose / Usage | Notes |
|---|---|---|
| **wallpaper-picker.sh** | Wallpaper selector using Wofi with thumbnails. Automatically applies Pywal colors, updates GNOME wallpaper, sets Fastfetch logo, and runs hooks. | Requires **ImageMagick**, **jq**, **wofi**, and Pywal installed. Open Bar GNOME extension may cause slight lag when changing wallpaper. |
| **cava-pywalsync.sh** | Syncs Cava’s gradient colors with Pywal’s palette. Automatically restarts Cava if it’s running. | Needs `jq` and `Pywal`. |
| **discord-pywalsync.sh** | Updates BetterDiscord custom CSS with Pywal colors by combining `colors.css`, header, and template. | ⚠️ Overwrites `custom.css` in BetterDiscord — keep a backup of personal changes. |
| **wlogout-pywalsync.sh** | Creates a blurred wallpaper background for Wlogout and updates its stylesheet with Pywal theme. | Needs **ImageMagick**. |
| **scaler-wallpaper.sh** | Ensures all wallpapers are scaled to **1920×1080**. Converts to `.png` and moves the original file into `~/Pictures/.backup` with incremental naming. | You can adjust the resolution based on your monitor resolution. |

# Applications

These are the main applications I use in my setup, most of which are themed with **Pywal** for consistency.

| Application | Purpose / Usage | Notes |
|---|---|---|
| **BetterDiscord** | Extends the Discord client with plugins and themes for customization. | ⚠️ Third-party mod, not officially supported by Discord. |
| **btop** | A modern terminal resource monitor for CPU, memory, disks, and processes. | Config in `~/.config/btop/`. |
| **Cava** | Terminal-based audio visualizer. | Integrated with Pywal for dynamic color themes. |
| **Fastfetch** | Fast system information tool (like neofetch). | Config in `~/.config/fastfetch/config.jsonc`. |
| **Pywal** | Generates color palettes from wallpapers and applies them system-wide. | Use my `wallpaper-picker.sh` and the hooks for auto theming according to the wallpaper. |
| **Pywalfox** | Browser extension and companion script that syncs Pywal colors to Firefox and Librewolf. | Needs the `pywalfox` helper script installed (`pip install pywalfox`). |
| **WezTerm** | GPU-accelerated terminal emulator with Lua configuration. | Config in `~/.config/wezterm/wezterm.lua`. |
| **Wlogout** | A simple logout/shutdown/suspend menu. | Config in `~/.config/wlogout/`. |
| **Wofi** | Application launcher and dmenu replacement. | Config in `~/.config/wofi/`. |
