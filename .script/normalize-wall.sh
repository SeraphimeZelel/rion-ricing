#!/bin/bash
# normalize-wall.sh
# Step 1: convert/resize wallpapers to 1920x1080 PNG, back up originals
# Step 2: normalize duplicate naming (name2 -> name_2, name__2 -> name_2)
# Existing files are never overwritten silently — collisions are skipped with a warning.

WALLPAPERS="$HOME/Pictures/Wallpaper"
BACKUP="$HOME/Pictures/.backup"

mkdir -p "$BACKUP"
cd "$WALLPAPERS" || { echo "Directory not found: $WALLPAPERS"; exit 1; }

command -v magick >/dev/null 2>&1 || { echo "ImageMagick not found. Install: sudo dnf install ImageMagick"; exit 1; }

shopt -s nullglob nocaseglob

# --- Step 1: convert & resize ---
echo "== Step 1: convert & resize =="

for img in *.jpg *.jpeg *.png *.webp *.bmp; do
    [[ -f "$img" ]] || continue

    read -r width height <<< "$(identify -format "%w %h" "$img" 2>/dev/null)"
    if [[ -z "$width" || -z "$height" ]]; then
        echo "Could not read resolution, skipping: $img"
        continue
    fi

    base="${img%.*}"
    orig_ext="${img##*.}"
    orig_ext_lc="${orig_ext,,}"
    new_name="${base}.png"

    # Already 1920x1080 PNG, nothing to do
    if [[ "$width" -eq 1920 && "$height" -eq 1080 && "$orig_ext_lc" == "png" ]]; then
        continue
    fi

    # Target name taken by a different file -> skip, don't overwrite
    if [[ -e "$new_name" && "$new_name" != "$img" ]]; then
        echo "'$new_name' already exists, skipping '$img'"
        continue
    fi

    # Convert to a temp file first so an in-place resize (same input/output name)
    # can't overwrite the original before it's backed up
    tmp_out="${WALLPAPERS}/.tmp_$$_${new_name}"
    if [[ "$width" -eq 1920 && "$height" -eq 1080 ]]; then
        magick "$img" "$tmp_out"            # format change only
    else
        magick "$img" -resize 1920x1080^ -gravity center -extent 1920x1080 "$tmp_out"
    fi

    if [[ $? -eq 0 ]]; then
        backup_name="$BACKUP/${base}.${orig_ext}"
        if [[ -e "$backup_name" ]]; then
            echo "Backup '$backup_name' already exists, skipping '$img'"
            rm -f -- "$tmp_out"
            continue
        fi

        mv -- "$img" "$backup_name"
        echo "Backed up: $backup_name"

        mv -- "$tmp_out" "$new_name"
        echo "Converted: $img -> $new_name"
    else
        echo "Convert failed: $img"
        rm -f -- "$tmp_out"
    fi
done

# --- Step 2: normalize duplicate naming ---
echo
echo "== Step 2: normalize naming =="

for f in *.png *.jpg *.jpeg *.webp *.bmp; do
    [[ -f "$f" ]] || continue

    name="${f%.*}"
    ext="${f##*.}"
    new_name="$f"

    # base + any number of underscores + trailing digits -> base_digits
    if [[ "$name" =~ ^(.*[^0-9_])_*([0-9]+)$ ]]; then
        new_name="${BASH_REMATCH[1]}_${BASH_REMATCH[2]}.${ext}"
    fi

    if [[ "$f" != "$new_name" ]]; then
        if [[ -e "$new_name" ]]; then
            echo "'$new_name' already exists, skipping: $f"
        else
            mv -i -- "$f" "$new_name"
            echo "Renamed: $f -> $new_name"
        fi
    fi
done

echo
echo "Done: $WALLPAPERS"