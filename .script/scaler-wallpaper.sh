#!/bin/bash

# PATH
WALLPAPERS="$HOME/Pictures/Wallpaper"
BACKUP="$HOME/Pictures/.backup"

# Make dirs if they don't exist
mkdir -p "$BACKUP"
cd "$WALLPAPERS" || exit 1

# Process all images
for img in *.{jpg,jpeg,png,webp,bmp}; do
    [[ -f "$img" ]] || continue

    # Check resolution
    read width height <<< $(identify -format "%w %h" "$img")
    if [[ "$width" -eq 1920 && "$height" -eq 1080 ]]; then
        continue
    fi

    base="${img%.*}"
    ext="png"                    # Converted wallpaper extension
    orig_ext="${img##*.}"        # Original extension for backup

    # --- Determine next available name in wallpaper folder ---
    max=0
    for f in "$base"_*.${ext} "$base".${ext}; do
        [[ -f "$f" ]] || continue
        if [[ "$f" =~ ${base}_([0-9]+)\.${ext}$ ]]; then
            (( ${BASH_REMATCH[1]} > max )) && max=${BASH_REMATCH[1]}
        elif [[ "$f" == "$base.$ext" ]]; then
            (( max < 1 )) && max=1
        fi
    done

    # Choose new file name
    if [[ $max -eq 0 ]]; then
        new_name="$base.$ext"
    else
        new_name="${base}_$((max + 1)).$ext"
    fi

    # Convert image
    if magick "$img" -resize 1920x1080^ -gravity center -extent 1920x1080 "$new_name"; then
        echo "Converted: $img -> $new_name"

        # --- Move original to backup with incremental name and original extension ---
        backup_base="$BACKUP/$base"
        backup_max=0
        for f in "$backup_base"_*.$orig_ext "$backup_base".$orig_ext; do
            [[ -f "$f" ]] || continue
            if [[ "$f" =~ ${backup_base}_([0-9]+)\.${orig_ext}$ ]]; then
                (( ${BASH_REMATCH[1]} > backup_max )) && backup_max=${BASH_REMATCH[1]}
            elif [[ "$f" == "$backup_base.$orig_ext" ]]; then
                (( backup_max < 1 )) && backup_max=1
            fi
        done

        if [[ $backup_max -eq 0 ]]; then
            backup_name="$BACKUP/$base.$orig_ext"
        else
            backup_name="$BACKUP/${base}_$((backup_max + 1)).$orig_ext"
        fi

        mv "$img" "$backup_name"
        echo "Moved original to backup: $backup_name"
    else
        echo "❌ Failed to convert: $img"
    fi
done

echo "✅ All Wallpapers has been processed $WALLPAPERS"

