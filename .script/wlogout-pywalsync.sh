#!/bin/bash

# Path
WALLPAPER=$(gsettings get org.gnome.desktop.background picture-uri-dark \
    | sed -E "s/^'file:\/\///; s/^\"file:\/\///; s/'$//; s/\"$//")
WALL_DIR="$HOME/Pictures/Wallpaper"
WALL_NAME="$(basename "$WALLPAPER")"
BLUR_BG="$HOME/.config/wlogout/images/wallpaper_blurred.png"
WALCSS="$HOME/.cache/wal/colors-waybar.css"
WL_TEMPLATE="$HOME/.config/wlogout/style-template.css"
WLCSS="$HOME/.config/wlogout/style.css"

mkdir -p "$(dirname "$BLUR_BG")"

# Generate Blurred Wallpaper
magick "$WALL_DIR/$WALL_NAME" -resize 1920x1080^ -gravity center -extent 1920x1080 -blur 0x8 -fill black -colorize 65% "$BLUR_BG"


# === UPDATE STYLE.CSS ===
cat "$WL_TEMPLATE" > "$WLCSS"