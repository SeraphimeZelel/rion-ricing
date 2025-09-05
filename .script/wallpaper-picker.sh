#!/bin/bash

# Config and Path
WALLPAPERS="$HOME/Pictures/Wallpaper"
CACHE_DIR="$HOME/.cache/wallpaper-picker"
THUMB_WIDTH="250"
THUMB_HEIGHT="141"
THEMES="$HOME/.config/wal/themes"
WAL_BIN="$HOME/.local/bin/wal"
HOOKS="$HOME/.config/wal/hooks/hooks.sh"
FASTFETCH_CFG="$HOME/.config/fastfetch/config.jsonc"

# Make the thumb dir if it's not exist
mkdir -p "$CACHE_DIR"

# Generate thumbnail
generate_thumbnail(){
    local input="$1"
    local output="$2"
    magick "$input" -thumbnail "${THUMB_WIDTH}x${THUMB_HEIGHT}^" \
        -gravity center -extent "${THUMB_WIDTH}x${THUMB_HEIGHT}" "$output"
}

# Generate menu with thumbnails
generate_menu(){
    # Find all images and sort naturally
    while IFS= read -r img; do
        [[ -f "$img" ]] || continue
        thumb="$CACHE_DIR/$(basename "${img%.*}").png"

        # Generate thumbnail if missing or outdated
        if [[ ! -f "$thumb" ]] || [[ "$img" -nt "$thumb" ]]; then
            generate_thumbnail "$img" "$thumb"
        fi

        # Output for wofi
        echo -en "img:$thumb\x00info:$(basename "$img")\x1f$img\n"
    done < <(find "$WALLPAPERS" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | sort -V)
}


# Run wofi with thumbnails
CHOICE=$(generate_menu | wofi --show dmenu \
    --cache-file /dev/null \
    --define "image-size=${THUMB_WIDTH}x${THUMB_HEIGHT}" \
    --columns 3 \
    --allow-images \
    --insensitive \
    --sort-order=default \
    --prompt "Select Wallpaper" \
    --conf ~/.config/wofi/wallpaper
)

[ -z "$CHOICE" ] && exit 0
WAL_NAME=$(basename "$CHOICE")
SELECTED="$WALLPAPERS/$WAL_NAME"

# Extract THEME name
BASENAME=$(basename "$SELECTED")
THEME="${BASENAME%%_*}"

# Default
WIFENAME=$(echo "$BASENAME" | awk -F '[_.]' '{print $2}' | sed 's/[0-9]*$//')
LOGO_PATH="$HOME/.config/fastfetch/logo/${THEME,,}_small.png"

# Mapping manual
if [[ "$THEME" =~ "Endfield" ]]; then
    LOGO_PATH="$HOME/.config/fastfetch/logo/john_endfield.png"
elif [[ "$THEME" =~ "Arknight" ]]; then
    LOGO_PATH="$HOME/.config/fastfetch/logo/john_arknights.png"
elif [[ "$THEME" =~ "Wuthering" ]]; then
    LOGO_PATH="$HOME/.config/fastfetch/logo/john_wuthering.png"
elif [[ "$THEME" =~ "Genshin" ]]; then
    LOGO_PATH="$HOME/.config/fastfetch/logo/john_genshin.png"
elif [[ "$THEME" =~ "StarRail" ]]; then
    LOGO_PATH="$HOME/.config/fastfetch/logo/john_starrail.png"
elif [[ "$THEME" =~ "Zenless" ]]; then
    LOGO_PATH="$HOME/.config/fastfetch/logo/john_zenless.png"
else
    LOGO_PATH="$HOME/.config/fastfetch/logo/john_wuthering.png"
fi

# Apply theme
THEME_FILE="$THEMES/$THEME.json"
if [ -f "$THEME_FILE" ]; then
    "$WAL_BIN" --theme "$THEME_FILE"
else
    "$WAL_BIN" -i "$SELECTED"
fi

# Update GNOME wallpaper
gsettings set org.gnome.desktop.background picture-uri-dark "file://$SELECTED"
gsettings set org.gnome.desktop.screensaver picture-uri "file://$SELECTED"

# Update fastfetch config
tmpfile=$(mktemp)
jq --arg logo "$LOGO_PATH" \
   --arg wife "$WIFENAME" \
   '
   .logo.source = $logo
   | (.modules[] | select(.key? == "wife  ").format) = $wife
   ' "$FASTFETCH_CFG" > "$tmpfile" && mv "$tmpfile" "$FASTFETCH_CFG"

touch "$HOME/.config/fastfetch/.reload_flag"

# Run pywal hooks
$HOOKS
$HOME/.local/bin/pywalfox update