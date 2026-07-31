#!/bin/bash
# normalize_wall.sh

WALLPAPERS="$HOME/Pictures/Wallpaper"
cd "$WALLPAPERS" || { echo "Directory not found: $WALLPAPERS"; exit 1; }

shopt -s nullglob
for f in *.png *.jpg *.jpeg *.webp *.bmp; do
    [[ -f "$f" ]] || continue

    clean="${f%\"}"
    clean="${clean#\"}"

    name="${clean%.*}"
    ext="${clean##*.}"

    new_name="$clean"

    if [[ "$name" =~ ^(.*[^0-9])([0-9]+)$ ]]; then
        base="${BASH_REMATCH[1]}"
        num="${BASH_REMATCH[2]}"

        if [[ "$base" == *_ ]]; then
            new_name="$clean"        
        else
            new_name="${base}_${num}.${ext}"
        fi
    fi

    if [[ "$clean" != "$new_name" ]]; then
        mv -i -- "$clean" "$new_name"
        echo "Renamed: $clean -> $new_name"
    fi
done

echo "All wallpapers normalized in $WALLPAPERS"