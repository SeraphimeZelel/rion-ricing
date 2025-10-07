#!/bin/bash

set -euo pipefail

bold="\033[1m"
green="\033[32m"
yellow="\033[33m"
red="\033[31m"
reset="\033[0m"

info() { echo -e "${bold}[*]${reset} $1"; }
ok() { echo -e "${green}[✓]${reset} $1"; }
warn() { echo -e "${yellow}[!]${reset} $1"; }
err() { echo -e "${red}[x]${reset} $1"; }

# Configuration flags
APPLY_GNOME_SETTINGS=false
INSTALL_EXTENSIONS=false
SKIP_APPS=false
SKIP_LINKS=false

usage() {
  cat << EOF
Usage: $0 [OPTIONS]

OPTIONS:
  --apply-gnome-settings    Apply GNOME settings (keybinds, UI tweaks, fonts)
  --install-extensions      Auto-install GNOME extensions (requires internet)
  --skip-apps              Skip application installation
  --skip-links             Skip config/script linking
  -h, --help               Show this help message

Examples:
  $0                                    # Basic install (apps + links)
  $0 --apply-gnome-settings             # Include GNOME settings
  $0 --install-extensions               # Include extensions auto-install
  $0 --apply-gnome-settings --install-extensions  # Full automation
  $0 --skip-apps                        # Only link configs/scripts
EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --apply-gnome-settings)
      APPLY_GNOME_SETTINGS=true
      shift
      ;;
    --install-extensions)
      INSTALL_EXTENSIONS=true
      shift
      ;;
    --skip-apps)
      SKIP_APPS=true
      shift
      ;;
    --skip-links)
      SKIP_LINKS=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      err "Unknown option: $1"
      usage
      exit 1
      ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOTFILES_DIR="$SCRIPT_DIR"
CONFIG_SRC="$DOTFILES_DIR/.config"
SCRIPTS_SRC="$DOTFILES_DIR/.script"
CONFIG_DST="$HOME/.config"
BIN_DST="$HOME/.local/bin"
BACKUP_ROOT="$HOME/.dotfiles-backup-$(date +%Y%m%d_%H%M%S)"

ensure_dirs() {
  mkdir -p "$CONFIG_DST" "$BIN_DST" "$BACKUP_ROOT"
}

backup_path() {
  local path="$1"
  local base
  base="$(basename "$path")"
  echo "$BACKUP_ROOT/$base"
}

link_config_items() {
  if [[ "$SKIP_LINKS" == "true" ]]; then
    info "Skipping config linking (--skip-links)"
    return
  fi
  
  if [[ ! -d "$CONFIG_SRC" ]]; then
    warn "No .config directory found in repo; skipping config linking."
    return
  fi

  info "Linking config directories from $CONFIG_SRC to $CONFIG_DST"
  shopt -s nullglob dotglob
  for item in "$CONFIG_SRC"/*; do
    local name
    name="$(basename "$item")"
    local target="$CONFIG_DST/$name"

    if [[ -e "$target" || -L "$target" ]]; then
      local backup
      backup="$(backup_path "$target")"
      info "Backing up $target → $backup"
      mv "$target" "$backup"
    fi

    info "Linking $item → $target"
    ln -s "$item" "$target"
  done
  ok "Configs linked. Backup at $BACKUP_ROOT"
}

link_script_items() {
  if [[ "$SKIP_LINKS" == "true" ]]; then
    info "Skipping script linking (--skip-links)"
    return
  fi
  
  if [[ ! -d "$SCRIPTS_SRC" ]]; then
    warn "No .script directory found in repo; skipping script linking."
    return
  fi

  info "Linking scripts from $SCRIPTS_SRC to $BIN_DST"
  shopt -s nullglob
  for file in "$SCRIPTS_SRC"/*; do
    [[ -f "$file" ]] || continue
    local name
    name="$(basename "$file")"
    local target="$BIN_DST/$name"

    if [[ -e "$target" || -L "$target" ]]; then
      local backup
      backup="$(backup_path "$target")"
      info "Backing up $target → $backup"
      mv "$target" "$backup"
    fi

    chmod +x "$file" || true
    info "Linking $file → $target"
    ln -s "$file" "$target"
  done
  ok "Scripts linked. Backup at $BACKUP_ROOT"
}

run_app_install() {
  if [[ "$SKIP_APPS" == "true" ]]; then
    info "Skipping application installation (--skip-apps)"
    return
  fi
  
  if [[ -x "$SCRIPT_DIR/install-apps.sh" ]]; then
    info "Running application installer..."
    "$SCRIPT_DIR/install-apps.sh"
  else
    warn "install-apps.sh not found or not executable. Skipping package installation."
  fi
}

apply_gnome_settings() {
  if [[ "$APPLY_GNOME_SETTINGS" != "true" ]]; then
    return
  fi
  
  info "Applying GNOME settings..."
  
  # Check if we're in a GNOME session
  if [[ "${XDG_CURRENT_DESKTOP:-}" != *"GNOME"* ]] && [[ "${DESKTOP_SESSION:-}" != *"gnome"* ]]; then
    warn "Not in a GNOME session. Skipping GNOME settings."
    return
  fi
  
  # UI and appearance settings
  gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark' 2>/dev/null || true
  gsettings set org.gnome.desktop.interface gtk-theme 'Adwaita-dark' 2>/dev/null || true
  gsettings set org.gnome.desktop.interface icon-theme 'Adwaita' 2>/dev/null || true
  gsettings set org.gnome.desktop.interface font-name 'Cantarell 11' 2>/dev/null || true
  gsettings set org.gnome.desktop.interface monospace-font-name 'JetBrains Mono 10' 2>/dev/null || true
  
  # Window behavior
  gsettings set org.gnome.mutter center-new-windows true 2>/dev/null || true
  gsettings set org.gnome.mutter focus-change-on-pointer-rest true 2>/dev/null || true
  
  # Keyboard shortcuts based on README
  gsettings set org.gnome.settings-daemon.plugins.media-keys custom-keybindings "['/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/', '/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom1/', '/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom2/', '/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom3/', '/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom4/']" 2>/dev/null || true
  
  # File Manager (Super + E)
  gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/ name 'File Manager' 2>/dev/null || true
  gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/ command 'nautilus' 2>/dev/null || true
  gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/ binding '<Super>e' 2>/dev/null || true
  
  # WezTerm (Super + T)
  gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom1/ name 'WezTerm' 2>/dev/null || true
  gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom1/ command 'wezterm' 2>/dev/null || true
  gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom1/ binding '<Super>t' 2>/dev/null || true
  
  # Wallpaper Picker (Alt + W)
  gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom2/ name 'Wallpaper Picker' 2>/dev/null || true
  gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom2/ command "$HOME/.local/bin/wallpaper-picker.sh" 2>/dev/null || true
  gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom2/ binding '<Alt>w' 2>/dev/null || true
  
  # Wlogout (Alt + L)
  gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom3/ name 'Wlogout' 2>/dev/null || true
  gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom3/ command 'wlogout' 2>/dev/null || true
  gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom3/ binding '<Alt>l' 2>/dev/null || true
  
  # Wofi (Alt + F)
  gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom4/ name 'Wofi' 2>/dev/null || true
  gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom4/ command 'wofi' 2>/dev/null || true
  gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom4/ binding '<Alt>f' 2>/dev/null || true
  
  # Favorite apps in dock
  gsettings set org.gnome.shell favorite-apps "['org.gnome.Nautilus.desktop', 'org.wezfurlong.wezterm.desktop']" 2>/dev/null || true
  
  # Other useful settings
  gsettings set org.gnome.desktop.wm.preferences button-layout 'appmenu:minimize,maximize,close' 2>/dev/null || true
  gsettings set org.gnome.shell.extensions.dash-to-dock show-mounts false 2>/dev/null || true
  
  ok "GNOME settings applied"
}

install_gnome_extensions() {
  if [[ "$INSTALL_EXTENSIONS" != "true" ]]; then
    return
  fi
  
  info "Installing GNOME extensions..."
  
  # Check if we're in a GNOME session
  if [[ "${XDG_CURRENT_DESKTOP:-}" != *"GNOME"* ]] && [[ "${DESKTOP_SESSION:-}" != *"gnome"* ]]; then
    warn "Not in a GNOME session. Skipping extensions installation."
    return
  fi
  
  # Check if gnome-extensions command is available
  if ! command -v gnome-extensions >/dev/null 2>&1; then
    warn "gnome-extensions command not found. Install gnome-shell-extensions package first."
    return
  fi
  
  # Extension UUIDs from extensions.gnome.org
  local extensions=(
    "forge@jmmaranan.com"                    # Forge
    "blur-my-shell@aunetx"                   # Blur My Shell
    "just-perfection-desktop@just-perfection" # Just Perfection
    "openbar@neuromorph"                     # Open Bar
    "quick-settings-tweaks@qwreey"           # Quick Settings Tweaks
  )
  
  local temp_dir
  temp_dir="$(mktemp -d)"
  
  for ext_uuid in "${extensions[@]}"; do
    info "Installing extension: $ext_uuid"
    
    # Try to get extension info and download URL
    local ext_info_url="https://extensions.gnome.org/extension-info/?uuid=$ext_uuid"
    local download_url
    
    if command -v curl >/dev/null 2>&1; then
      download_url=$(curl -s "$ext_info_url" | grep -o '"download_url":"[^"]*"' | cut -d'"' -f4 | head -1) || true
    elif command -v wget >/dev/null 2>&1; then
      download_url=$(wget -qO- "$ext_info_url" | grep -o '"download_url":"[^"]*"' | cut -d'"' -f4 | head -1) || true
    else
      warn "Neither curl nor wget available. Cannot download extensions."
      rm -rf "$temp_dir"
      return
    fi
    
    if [[ -n "$download_url" ]]; then
      local zip_file="$temp_dir/${ext_uuid}.zip"
      
      if command -v curl >/dev/null 2>&1; then
        curl -s -L "https://extensions.gnome.org$download_url" -o "$zip_file"
      else
        wget -q "https://extensions.gnome.org$download_url" -O "$zip_file"
      fi
      
      if [[ -f "$zip_file" ]]; then
        if gnome-extensions install "$zip_file" 2>/dev/null; then
          gnome-extensions enable "$ext_uuid" 2>/dev/null || true
          ok "Installed and enabled: $ext_uuid"
        else
          warn "Failed to install: $ext_uuid"
        fi
      else
        warn "Failed to download: $ext_uuid"
      fi
    else
      warn "Could not find download URL for: $ext_uuid"
    fi
  done
  
  rm -rf "$temp_dir"
  
  info "Extensions installation complete. You may need to restart GNOME Shell (Alt+F2, type 'r', press Enter)"
}

post_notes() {
  echo
  if [[ "$INSTALL_EXTENSIONS" != "true" ]]; then
    info "Manual step required: GNOME Extensions"
    echo -e "Install these extensions manually from ${bold}https://extensions.gnome.org${reset}:"
    echo "- Forge"
    echo "- Blur My Shell"
    echo "- Just Perfection"
    echo "- Open Bar"
    echo "- Quick Settings Tweaks"
    echo -e "Or run: ${bold}$0 --install-extensions${reset} to install automatically"
    echo
  fi
  
  if [[ "$APPLY_GNOME_SETTINGS" != "true" ]]; then
    info "Optional: Apply GNOME settings"
    echo -e "Run: ${bold}$0 --apply-gnome-settings${reset} to configure keybinds and UI settings"
    echo
  fi
}

main() {
  info "Starting combined installer"
  ensure_dirs
  run_app_install
  link_config_items
  link_script_items
  apply_gnome_settings
  install_gnome_extensions
  ok "All tasks completed. Backup directory: $BACKUP_ROOT"
  post_notes
}

main "$@"


