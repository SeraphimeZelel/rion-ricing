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

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_SRC="$SCRIPT_DIR/.config"
SCRIPTS_SRC="$SCRIPT_DIR/.script"
CONFIG_DST="$HOME/.config"
BIN_DST="$HOME/.local/bin"

check_packages() {
  info "Checking required packages..."
  local packages=(
    jq
    convert  # ImageMagick
    wal      # pywal
    wezterm
    cava
    btop
    fastfetch
    wlogout
    nautilus
    gnome-tweaks
  )
  
  local missing=()
  for pkg in "${packages[@]}"; do
    if command -v "$pkg" >/dev/null 2>&1; then
      ok "$pkg found"
    else
      err "$pkg missing"
      missing+=("$pkg")
    fi
  done
  
  if (( ${#missing[@]} > 0 )); then
    warn "Missing packages: ${missing[*]}"
    echo "Run ./install-apps.sh to install missing packages"
    return 1
  fi
}

check_config_links() {
  info "Checking config symlinks..."
  local broken=()
  local missing=()
  
  if [[ -d "$CONFIG_SRC" ]]; then
    for item in "$CONFIG_SRC"/*; do
      local name
      name="$(basename "$item")"
      local target="$CONFIG_DST/$name"
      
      if [[ -L "$target" ]]; then
        if [[ -e "$target" ]]; then
          local link_target
          link_target="$(readlink "$target")"
          if [[ "$link_target" == "$item" ]]; then
            ok "$name → correctly linked"
          else
            warn "$name → linked to wrong target: $link_target"
            broken+=("$name")
          fi
        else
          err "$name → broken symlink"
          broken+=("$name")
        fi
      else
        err "$name → not linked"
        missing+=("$name")
      fi
    done
  fi
  
  if (( ${#broken[@]} > 0 || ${#missing[@]} > 0 )); then
    warn "Config issues found. Run ./install.sh --skip-apps to fix links"
    return 1
  fi
}

check_script_links() {
  info "Checking script symlinks..."
  local broken=()
  local missing=()
  
  if [[ -d "$SCRIPTS_SRC" ]]; then
    for file in "$SCRIPTS_SRC"/*; do
      [[ -f "$file" ]] || continue
      local name
      name="$(basename "$file")"
      local target="$BIN_DST/$name"
      
      if [[ -L "$target" ]]; then
        if [[ -e "$target" ]]; then
          local link_target
          link_target="$(readlink "$target")"
          if [[ "$link_target" == "$file" ]]; then
            if [[ -x "$target" ]]; then
              ok "$name → correctly linked and executable"
            else
              warn "$name → linked but not executable"
            fi
          else
            warn "$name → linked to wrong target: $link_target"
            broken+=("$name")
          fi
        else
          err "$name → broken symlink"
          broken+=("$name")
        fi
      else
        err "$name → not linked"
        missing+=("$name")
      fi
    done
  fi
  
  if (( ${#broken[@]} > 0 || ${#missing[@]} > 0 )); then
    warn "Script issues found. Run ./install.sh --skip-apps to fix links"
    return 1
  fi
}

check_gnome_extensions() {
  info "Checking GNOME extensions..."
  
  if [[ "${XDG_CURRENT_DESKTOP:-}" != *"GNOME"* ]] && [[ "${DESKTOP_SESSION:-}" != *"gnome"* ]]; then
    warn "Not in a GNOME session, skipping extension check"
    return 0
  fi
  
  if ! command -v gnome-extensions >/dev/null 2>&1; then
    warn "gnome-extensions command not found"
    return 0
  fi
  
  local extensions=(
    "forge@jmmaranan.com"
    "blur-my-shell@aunetx"
    "just-perfection-desktop@just-perfection"
    "openbar@neuromorph"
    "quick-settings-tweaks@qwreey"
  )
  
  local missing=()
  local disabled=()
  
  for ext in "${extensions[@]}"; do
    if gnome-extensions list | grep -q "$ext"; then
      if gnome-extensions info "$ext" | grep -q "State: ENABLED"; then
        ok "$ext installed and enabled"
      else
        warn "$ext installed but disabled"
        disabled+=("$ext")
      fi
    else
      err "$ext not installed"
      missing+=("$ext")
    fi
  done
  
  if (( ${#missing[@]} > 0 )); then
    warn "Missing extensions: ${missing[*]}"
    echo "Run ./install.sh --install-extensions to install them"
  fi
  
  if (( ${#disabled[@]} > 0 )); then
    warn "Disabled extensions: ${disabled[*]}"
    echo "Enable them manually or run ./install.sh --install-extensions"
  fi
  
  if (( ${#missing[@]} > 0 || ${#disabled[@]} > 0 )); then
    return 1
  fi
}

check_pywal_cache() {
  info "Checking pywal cache..."
  
  if [[ -f "$HOME/.cache/wal/colors.json" ]]; then
    ok "Pywal colors cache exists"
  else
    warn "No pywal colors cache found"
    echo "Run a wallpaper picker script to generate colors"
    return 1
  fi
}

check_wezterm_config() {
  info "Checking WezTerm config..."
  
  if command -v wezterm >/dev/null 2>&1; then
    if wezterm --config-file "$CONFIG_DST/wezterm/wezterm.lua" --version >/dev/null 2>&1; then
      ok "WezTerm config loads successfully"
    else
      warn "WezTerm config has issues"
      return 1
    fi
  else
    warn "WezTerm not installed, skipping config check"
  fi
}

main() {
  info "Running health check for Rion's dotfiles..."
  echo
  
  local checks=(
    check_packages
    check_config_links
    check_script_links
    check_gnome_extensions
    check_pywal_cache
    check_wezterm_config
  )
  
  local failed=0
  for check in "${checks[@]}"; do
    if ! $check; then
      ((failed++))
    fi
    echo
  done
  
  if (( failed == 0 )); then
    ok "All checks passed! Your dotfiles setup is healthy."
  else
    warn "$failed check(s) failed. See suggestions above."
    exit 1
  fi
}

main "$@"
