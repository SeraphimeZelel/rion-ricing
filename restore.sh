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

usage() {
  cat << EOF
Usage: $0 [OPTIONS] [BACKUP_DIR]

Restore configs from backup or uninstall dotfiles symlinks.

OPTIONS:
  --list-backups       List available backup directories
  --uninstall         Remove all dotfiles symlinks (no restore)
  --dry-run           Show what would be restored/removed
  -h, --help          Show this help message

BACKUP_DIR:
  Path to backup directory (e.g., ~/.dotfiles-backup-20231215_143022)
  If not provided, will use the most recent backup found.

Examples:
  $0                                    # Restore from latest backup
  $0 ~/.dotfiles-backup-20231215_143022 # Restore from specific backup
  $0 --uninstall                       # Remove all symlinks
  $0 --list-backups                    # Show available backups
EOF
}

list_backups() {
  info "Available backup directories:"
  local found=false
  for backup in "$HOME"/.dotfiles-backup-* "$HOME"/.config-backup-*; do
    if [[ -d "$backup" ]]; then
      local timestamp
      timestamp=$(basename "$backup" | grep -o '[0-9]\{8\}_[0-9]\{6\}' || echo "unknown")
      echo "  $backup (created: $timestamp)"
      found=true
    fi
  done
  
  if [[ "$found" == "false" ]]; then
    warn "No backup directories found"
    exit 1
  fi
}

find_latest_backup() {
  local latest=""
  local latest_time=0
  
  for backup in "$HOME"/.dotfiles-backup-* "$HOME"/.config-backup-*; do
    if [[ -d "$backup" ]]; then
      local mtime
      mtime=$(stat -c %Y "$backup" 2>/dev/null || echo "0")
      if (( mtime > latest_time )); then
        latest_time=$mtime
        latest="$backup"
      fi
    fi
  done
  
  echo "$latest"
}

remove_symlinks() {
  local dry_run="$1"
  
  info "Removing dotfiles symlinks..."
  
  # Remove config symlinks
  if [[ -d "$CONFIG_SRC" ]]; then
    for item in "$CONFIG_SRC"/*; do
      local name
      name="$(basename "$item")"
      local target="$CONFIG_DST/$name"
      
      if [[ -L "$target" ]]; then
        local link_target
        link_target="$(readlink "$target")"
        if [[ "$link_target" == "$item" ]]; then
          if [[ "$dry_run" == "true" ]]; then
            info "[DRY RUN] Would remove symlink: $target"
          else
            rm "$target"
            ok "Removed symlink: $target"
          fi
        fi
      fi
    done
  fi
  
  # Remove script symlinks
  if [[ -d "$SCRIPTS_SRC" ]]; then
    for file in "$SCRIPTS_SRC"/*; do
      [[ -f "$file" ]] || continue
      local name
      name="$(basename "$file")"
      local target="$BIN_DST/$name"
      
      if [[ -L "$target" ]]; then
        local link_target
        link_target="$(readlink "$target")"
        if [[ "$link_target" == "$file" ]]; then
          if [[ "$dry_run" == "true" ]]; then
            info "[DRY RUN] Would remove symlink: $target"
          else
            rm "$target"
            ok "Removed symlink: $target"
          fi
        fi
      fi
    done
  fi
}

restore_from_backup() {
  local backup_dir="$1"
  local dry_run="$2"
  
  if [[ ! -d "$backup_dir" ]]; then
    err "Backup directory not found: $backup_dir"
    exit 1
  fi
  
  info "Restoring from backup: $backup_dir"
  
  # First remove existing symlinks
  remove_symlinks "$dry_run"
  
  # Restore files from backup
  for item in "$backup_dir"/*; do
    [[ -e "$item" ]] || continue
    local name
    name="$(basename "$item")"
    local config_target="$CONFIG_DST/$name"
    local bin_target="$BIN_DST/$name"
    
    # Determine target based on where it should go
    local target=""
    if [[ -d "$CONFIG_SRC/$name" ]] || [[ -f "$CONFIG_SRC/$name" ]]; then
      target="$config_target"
    elif [[ -f "$SCRIPTS_SRC/$name" ]]; then
      target="$bin_target"
    else
      # Default to config
      target="$config_target"
    fi
    
    if [[ "$dry_run" == "true" ]]; then
      info "[DRY RUN] Would restore: $item → $target"
    else
      if [[ -e "$target" ]]; then
        warn "Target exists, backing up: $target → $target.pre-restore"
        mv "$target" "$target.pre-restore"
      fi
      
      mv "$item" "$target"
      ok "Restored: $target"
    fi
  done
  
  if [[ "$dry_run" != "true" ]]; then
    # Remove empty backup directory
    if [[ -d "$backup_dir" ]] && [[ -z "$(ls -A "$backup_dir")" ]]; then
      rmdir "$backup_dir"
      ok "Removed empty backup directory: $backup_dir"
    fi
  fi
}

main() {
  local backup_dir=""
  local dry_run="false"
  local uninstall="false"
  local list_only="false"
  
  # Parse arguments
  while [[ $# -gt 0 ]]; do
    case $1 in
      --list-backups)
        list_only="true"
        shift
        ;;
      --uninstall)
        uninstall="true"
        shift
        ;;
      --dry-run)
        dry_run="true"
        shift
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      -*)
        err "Unknown option: $1"
        usage
        exit 1
        ;;
      *)
        backup_dir="$1"
        shift
        ;;
    esac
  done
  
  if [[ "$list_only" == "true" ]]; then
    list_backups
    exit 0
  fi
  
  if [[ "$uninstall" == "true" ]]; then
    info "Uninstalling dotfiles (removing symlinks only)"
    remove_symlinks "$dry_run"
    if [[ "$dry_run" != "true" ]]; then
      ok "Uninstall complete"
    fi
    exit 0
  fi
  
  # Find backup directory
  if [[ -z "$backup_dir" ]]; then
    backup_dir="$(find_latest_backup)"
    if [[ -z "$backup_dir" ]]; then
      err "No backup directory found. Use --list-backups to see available backups."
      exit 1
    fi
    info "Using latest backup: $backup_dir"
  fi
  
  restore_from_backup "$backup_dir" "$dry_run"
  
  if [[ "$dry_run" != "true" ]]; then
    ok "Restore complete"
  else
    info "Dry run complete. Run without --dry-run to actually restore."
  fi
}

main "$@"
