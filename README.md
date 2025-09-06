<div align="center">

[![Typing SVG](https://readme-typing-svg.demolab.com?font=JetBrains+Mono&size=30&duration=2000&pause=2500&color=9A0000&center=true&vCenter=true&width=435&lines=Rion's+Dotfiles)](https://git.io/typing-svg)

</div>

# Showcase
[![Watch the video](https://img.youtube.com/vi/tJPglNR69ok/hqdefault.jpg)](https://youtu.be/tJPglNR69ok)

This contains My Fedora Linux dotfiles for a Hyprland-looks in **GNOME** setup.

**ENJOY!**

-Rion Zaphkiel

> [!WARNING] 
>  
> All Configurations were meant to be used with `Pywal`
>

---

## GNOME Extensions

<details>
<summary>🪟 Forge</summary>

### Description
Tiling and window manager for GNOME.

### Settings
You can follow my settings to get the same style in screenshot below, or you can tweak it as you will.

> <details>
> <summary>📸 Show Screenshot</summary>
>
> 
>
> </details>

---
</details>


<details>
<summary>🎛️ Just Perfection</summary>

### Description
Tweak Tool to Customize GNOME Shell, Change the Behavior and Disable UI Elements.

### Settings
You can follow my settings to get the same style in screenshot below, or you can tweak it as you will.

> <details>
> <summary>📸 Show Screenshot</summary>
>
> 
>
> </details>

---
</details>


<details>
<summary>🎵 Media Controls</summary>

### Description
Show controls and information of the currently playing media in the panel.

### Settings
You can follow my settings to get the same style in screenshot below, or you can tweak it as you will.

> <details>
> <summary>📸 Show Screenshot</summary>
>
> 
>
> </details>

---
</details>



<details>
<summary>🍹 Open Bar</summary>

### Description
Top Bar / Top Panel , Menus , Dash / Dock , Gnome Shell , Gtk Apps theming. Open the bar and let the colors flow.

### Settings
You can follow my settings to get the same style in screenshot below, or you can tweak it as you will.

> <details>
> <summary>📸 Show Screenshot</summary>
>
> 
>
> </details>

---
</details>



<details>
<summary>⚡ Quick Settings Tweaks</summary>

### Description
Enhances the quick settings menu with extra toggles and controls.

### Settings
You can follow my settings to get the same style in screenshot below, or you can tweak it as you will.

> <details>
> <summary>📸 Show Screenshot</summary>
>
> 
>
> </details>

---
</details>

<details>
<summary>Other cool extension</summary>

- Clipboard Indicator : The most popular clipboard manager for GNOME

- Workspace Indicator : Put an indicator on the panel signaling in which workspace you are, and give you the possibility of switching to another one.

- Move Workspace Indicator : Replace native Activities Indicator by Workspace Indicator. Nothing else. Obviously, you have to install and activate official Workspace Indicator extension.

- System Monitor : Monitor system from the top bar

- Unblank lock screen : Unblank lock screen. Helping for ricing showcase
</details>


## Applications
<details>
  <summary>🎨 BetterDiscord</summary>

### Overview
- ✔️ BetterDiscord is a client mod with endless flexibility and addons. The only limit to the customization is your own imagination.
- 🧩 Extending the platform is as easy as clicking install on a plugin or theme.
- 🎨 BetterDiscord will help you have a beautiful and more useful user experience on Discord.

### Installation
1. Install [BetterDiscord](https://docs.betterdiscord.app/users/getting-started/installation#manual-installation).
2. Restart Discord.

### Configuration
1. On Settings > BetterDiscord > Enable Custom CSS and Enable Transparency.
2. Paste the `.config/BetterDiscord` into `~/.config/BetterDiscord`
3. `discord-pywalsync.sh` is used to overwrite the css color with pywal generated color palette. The script calls as a hook when running `wallpaper-picker.sh` so it automatically matches the color whenever you change your wallpaper.

### Notes
⚠️ BetterDiscord is third-party and not officially supported by Discord. Use at your own risk.

---
</details>

<details>
  <summary>📊 btop</summary>

### Overview
Resource monitor that shows usage and stats for processor, memory, disks, network and processes.

### Installation
1. Install [btop](https://github.com/aristocratos/btop?tab=readme-ov-file#installation)

### Configuration
1. Paste the `.config/btop` into `~/.config/btop`

---
</details>

<details>
  <summary>🎶 Cava</summary>

### Overview  
Cross-platform Audio Visualizer. Cava is a bar spectrum audio visualizer for terminal or desktop (SDL).

### Installation
1. Install [cava](https://github.com/karlstav/cava?tab=readme-ov-file#installing)

### Configuration
1. Paste the `.config/cava` into `~/.config/cava`
2. `cava-pywalsync.sh` is used to match the cava color with pywal generated color palette. The script calls as a hook when running `wallpaper-picker.sh` so it automatically matches the color whenever you change your wallpaper.

---
</details>

<details>
  <summary>⚡ Fastfetch</summary>
  
### Overview
Fastfetch is a neofetch-like tool for fetching system information and displaying it in a visually appealing way. It is written mainly in C, with a focus on performance and customizability. Currently, it supports Linux, macOS, Windows 7+, Android, FreeBSD, OpenBSD, NetBSD, DragonFly, Haiku, and SunOS.

### Installation
1. Install [fastfetch](https://github.com/fastfetch-cli/fastfetch?tab=readme-ov-file#installation)

### Configuration
1. Paste the `.config/fastfetch` into `~/.config/fastfetch`
2. `wallpaper-picker.sh` changes the logo and the wife name, based on the wallpaper name. i.e. if the file name is `Arknight_Theresa`, then the logo will set into `john_arknight` and the wife name into `Theresa`.
3. `fastfetch_auto.sh` is a script that detects the change of fastfetch config and reloads it, so you don’t have to call fastfetch multiple times.

---
</details>

<details>
  <summary>🌈 Pywal</summary>
    
### Overview
Pywal is a tool that generates a color palette from the dominant colors in an image. It then applies the colors system-wide and on-the-fly in all of your favourite programs.

### Installation
1. Install [pywal](https://github.com/dylanaraps/pywal/wiki/Installation)

### Configuration
1. Paste the `.config/wal` into `~/.config/wal`
2. `wallpaper-picker.sh` calls pywal to generate color palette based on the wallpaper name (if the theme exists) or the dominant color of your wallpaper. i.e. I have `.config/wal/themes/Arknights.json` so if I set my wallpaper to `Arknights_Amiya` it applies the predefined theme rather than the dominant color of the wallpaper. It also calls `.config/wal/hooks/hooks.sh`.
3. `hooks.sh` syncs the theme across all of the applications that are being used.

---
</details>

<details>
  <summary>🖥️ WezTerm</summary>
  
### Overview
WezTerm is a powerful cross-platform terminal emulator and multiplexer written by @wez and implemented in Rust.

### Installation
1. Install [wezterm](https://wezterm.org/installation)

### Configuration
1. Paste the `.config/wezterm` into `~/.config/wezterm`

---
</details>

<details>
  <summary>🚪 Wlogout</summary>

### Overview
A Wayland-based logout menu.

### Installation
1. Install [wlogout](https://github.com/ArtsyMacaw/wlogout)

### Configuration
1. Paste the `.config/wlogout` into `~/.config/wlogout`
2. `wlogout-pywalsync.sh` is used to get your set wallpaper, and makes it blur to use as a background in wlogout.

---
</details>

<details>
  <summary>🔍 Wofi</summary>

### Overview
Wofi is a launcher/menu program for wlroots-based Wayland compositors such as sway.

### Installation
1. Install [wofi](https://github.com/SimplyCEO/wofi?tab=readme-ov-file#building)

### Configuration
1. Paste the `.config/wofi` into `~/.config/wofi`
2. `wallpaper-picker.sh` calls wofi to show the thumbnail of available wallpapers — don’t forget to set the right path to your wallpaper directory. 

---
</details>

<details>
<summary>✨ Other cool applications</summary>

- 🎵 **kew**: Listen to music in the terminal.  
- 💻 **CMatrix**: A terminal screensaver that simulates the “Matrix rain” effect, just like in the movie.

</details>


## Script

> [!WARNING] 
>  
> To fully utilize the scripts, you need to install a few dependencies:
>
> ```
> jq
> ImageMagick
> wofi
> pywal
> ```
>
---

<details>
  <summary>🖼 wallpaper-picker.sh</summary>

### What it does
- Provides a wallpaper picker using **Wofi** with image thumbnails.  
- Automatically applies Pywal colors, updates GNOME wallpaper, changes Fastfetch logo, and runs hooks.  
- Integrates with **Pywalfox** to update Firefox theme.  

### Notes on Color Backends
Pywal supports different color extraction backends that slightly change the generated palette.  
You can switch backends by adding the `--backend` argument after `"$WAL_BIN" -i "$SELECTED"` in `wallpaper-picker.sh`.  

- **wal (default)** → balanced palette, optimized for terminals.  
- **colorz** → stronger contrast, fewer dominant colors. (Looks great on Chiori wallpapers).  
- **haishoku** → softer palettes with lower contrast. 

This setup is optimized for the default **wal** backend.  
However, you can further customize the derived color variables if you’re not satisfied with the results:

- 🎶 For **Cava**, change the gradient source in `cava-pywalsync.sh`, e.g.  
  ```bash
  COLOR1=$(jq -r '.colors.color8' "$WAL_COLORS")
  ```
  to
  ```bash
  COLOR1=$(jq -r '.colors.color5' "$WAL_COLORS")
  ```

- 💬 For Discord, edit the variables inside `~/.config/BetterDiscord/bd-template.css`, replacing var(--color) with another Pywal color of your choice.

#### Installing extra backends

```bash
pip install colorz
pip install haishoku
```

#### Color Backend Palette Comparison 


---
</details>

<details>
  <summary>🎶 cava-pywalsync.sh</summary>

### What it does
- Syncs **Cava’s** gradient colors with Pywal’s generated color scheme.  
- Automatically restarts Cava to apply the new colors.  

---
</details>

<details>
  <summary>💬 discord-pywalsync.sh</summary>

### What it does
- Updates **BetterDiscord’s** `custom.css` file using Pywal colors.  
- Combines your header, Pywal CSS, and template into one file.  
- Ensures Discord follows the same color scheme as the rest of your rice.  

---
</details>

<details>
  <summary>🖼 scaler-wallpaper.sh</summary>

### What it does
- Ensures all wallpapers are scaled to **1920x1080** resolution.  
- Converts them to `.png` format if necessary.  
- Moves the original wallpaper to `~/Pictures/.backup` with incremental names for safe keeping.  

---
</details>

<details>
  <summary>🚪 wlogout-pywalsync.sh</summary>

### What it does
- Generates a blurred and darkened version of your current wallpaper for **Wlogout** background.  
- Updates `style.css` for Wlogout with Pywal colors.  
- Keeps logout menu consistent with your rice.  

---
</details>


## Help

A quick setup

1. Clone the repo

2. Symlink the Config

3. Symlink the Script 

3. Chmod the Script.

Later, I'll make the video on how to setup from the start (in nobara).

## Notes


<div align=center>

[![Typing SVG](https://readme-typing-svg.demolab.com?font=JetBrains+Mono&size=30&duration=2000&pause=2500&color=DFCB00&center=true&vCenter=true&width=435&lines=Endfield+Copium+Corner)](https://git.io/typing-svg)

</div>