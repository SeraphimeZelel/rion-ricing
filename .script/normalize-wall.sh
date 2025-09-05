#!/bin/bash
# normalize_wallpapers.sh
# Renames wallpapers to have _ before trailing numbers

WALLPAPERS="$HOME/Pictures/Wallpaper"
cd "$WALLPAPERS" || { echo "Directory not found: $WALLPAPERS"; exit 1; }

for f in *.png *.jpg *.jpeg *.webp *.bmp; do
    [[ -f "$f" ]] || continue

    # Remove surrounding quotes if any
    clean="${f%\"}"
    clean="${clean#\"}"

    # Split name and extension
    name="${clean%.*}"
    ext="${clean##*.}"

    # If name ends with number without _, add _
    if [[ "$name" =~ ^(.*[^0-9])([0-9]+)$ ]]; then
        new_name="${BASH_REMATCH[1]}_${BASH_REMATCH[2]}.$ext"

        # Only rename if different
        if [[ "$clean" != "$new_name" ]]; then
            mv -i "$clean" "$new_name"
            echo "Renamed: $clean -> $new_name"
        fi
    fi
done

echo "✅ All wallpapers normalized in $WALLPAPERS"

