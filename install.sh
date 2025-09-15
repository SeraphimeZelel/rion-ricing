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
  if [[ -x "$SCRIPT_DIR/install-apps.sh" ]]; then
    info "Running application installer..."
    "$SCRIPT_DIR/install-apps.sh"
  else
    warn "install-apps.sh not found or not executable. Skipping package installation."
  fi
}

post_notes() {
  echo
  info "Manual step required: GNOME Extensions"
  echo -e "Install these extensions manually from ${bold}https://extensions.gnome.org${reset}:"
  echo "- Forge"
  echo "- Blur My Shell"
  echo "- Just Perfection"
  echo "- Open Bar"
  echo "- Quick Settings Tweaks"
  echo
}

main() {
  info "Starting combined installer"
  ensure_dirs
  run_app_install
  link_config_items
  link_script_items
  ok "All tasks completed. Backup directory: $BACKUP_ROOT"
  post_notes
}

main "$@"


