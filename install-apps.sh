#!/bin/bash

set -u

# Simple logging helpers
bold="\033[1m"
green="\033[32m"
yellow="\033[33m"
red="\033[31m"
reset="\033[0m"

info() { echo -e "${bold}[*]${reset} $1"; }
ok() { echo -e "${green}[✓]${reset} $1"; }
warn() { echo -e "${yellow}[!]${reset} $1"; }
err() { echo -e "${red}[x]${reset} $1"; }

require_file() {
  if [[ ! -f "$1" ]]; then
    err "Required file '$1' not found. Exiting."
    exit 1
  fi
}

detect_distro() {
  require_file "/etc/os-release"
  # shellcheck disable=SC1091
  . /etc/os-release
  local id like
  id="${ID:-}"
  like="${ID_LIKE:-}"
  id="${id,,}"
  like="${like,,}"

  if [[ "$id" == "arch" || "$like" == *"arch"* ]]; then
    echo "arch"
  elif [[ "$id" == "fedora" || "$like" == *"fedora"* ]]; then
    echo "fedora"
  elif [[ "$id" == "ubuntu" || "$id" == "debian" || "$like" == *"debian"* || "$like" == *"ubuntu"* ]]; then
    echo "debian"
  else
    echo "unsupported"
  fi
}

install_arch() {
  info "Updating package database (pacman)..."
  sudo pacman -Syu --noconfirm | cat
  local packages=(
    jq
    imagemagick
    python-pywal
    wezterm
    cava
    btop
    fastfetch
    wlogout
    nautilus
    gnome-tweaks
    gnome-shell-extensions
  )
  local failed=()
  info "Installing packages with pacman..."
  for pkg in "${packages[@]}"; do
    info "Installing $pkg..."
    if sudo pacman -S --needed --noconfirm "$pkg" | cat; then
      ok "$pkg installed"
    else
      warn "Failed to install $pkg"
      failed+=("$pkg")
    fi
  done
  if (( ${#failed[@]} > 0 )); then
    warn "Some packages failed on Arch: ${failed[*]}"
  fi
}

install_fedora() {
  info "Updating packages (dnf)..."
  sudo dnf -y upgrade --refresh | cat
  local packages=(
    jq
    ImageMagick
    python3-pywal
    wezterm
    cava
    btop
    fastfetch
    wlogout
    nautilus
    gnome-tweaks
    gnome-shell-extensions
  )
  local failed=()
  info "Installing packages with dnf..."
  for pkg in "${packages[@]}"; do
    info "Installing $pkg..."
    if sudo dnf -y install "$pkg" | cat; then
      ok "$pkg installed"
    else
      warn "Failed to install $pkg"
      failed+=("$pkg")
      # Helpful hint for common cases
      if [[ "$pkg" == "wezterm" ]]; then
        warn "WezTerm may require COPR: sudo dnf copr enable wezfurlong/wezterm -y && sudo dnf install wezterm -y"
      fi
    fi
  done
  if (( ${#failed[@]} > 0 )); then
    warn "Some packages failed on Fedora: ${failed[*]}"
  fi
}

install_debian() {
  info "Updating package lists (apt)..."
  sudo apt-get update -y | cat
  info "Upgrading installed packages (apt)..."
  sudo apt-get upgrade -y | cat
  local packages=(
    jq
    imagemagick
    python3-pywal
    wezterm
    cava
    btop
    fastfetch
    wlogout
    nautilus
    gnome-tweaks
    gnome-shell-extensions
  )
  local failed=()
  info "Installing packages with apt..."
  for pkg in "${packages[@]}"; do
    info "Installing $pkg..."
    if sudo apt-get install -y "$pkg" | cat; then
      ok "$pkg installed"
    else
      warn "Failed to install $pkg"
      failed+=("$pkg")
      if [[ "$pkg" == "wezterm" ]]; then
        warn "WezTerm may not be in your Ubuntu/Debian repo. Install the .deb from the official releases."
      fi
    fi
  done
  if (( ${#failed[@]} > 0 )); then
    warn "Some packages failed on Ubuntu/Debian: ${failed[*]}"
  fi
}

main() {
  info "Detecting Linux distribution..."
  distro="$(detect_distro)"
  case "$distro" in
    arch)
      ok "Detected Arch Linux"
      install_arch
      ;;
    fedora)
      ok "Detected Fedora"
      install_fedora
      ;;
    debian)
      ok "Detected Ubuntu/Debian"
      install_debian
      ;;
    *)
      err "Unsupported Linux distribution. Exiting."
      exit 1
      ;;
  esac

  echo
  info "Manual step required: GNOME Extensions"
  echo -e "Install these extensions manually from ${bold}https://extensions.gnome.org${reset}:"
  echo "- Forge"
  echo "- Blur My Shell"
  echo "- Just Perfection"
  echo "- Open Bar"
  echo "- Quick Settings Tweaks"
  echo
  ok "All steps completed."
}

main "$@"