#!/bin/bash

# Directory you want to organize (default: current directory)
DIR="${1:-.}"
DIR="$(realpath "$DIR")" 

# Ask for confirmation
read -p "Sort the files in $DIR ? [y/N]: " confirm
case "$confirm" in
    [yY][eE][sS]|[yY]) 
        echo "Sorting files in $DIR..."
        ;;
    *)
        echo "Aborted."
        exit 0
        ;;
esac

# Define groups of extensions
photos=("jpg" "jpeg" "png" "gif" "bmp" "tiff" "webp")
videos=("mp4" "mkv" "avi" "mov" "flv" "wmv" "webm")
documents=("doc" "docx" "odt" "pdf" "txt" "rtf" "xlsx" "xls" "ppt" "pptx" "csv")
compressed=("zip" "tar" "gz" "rar" "7z" "bz2")
audio=("mp3" "wav" "flac" "aac" "ogg" "m4a")

# Create function to check if value in array
in_array() {
  local e match="$1"; shift
  for e; do [[ "$e" == "$match" ]] && return 0; done
  return 1
}

# Loop through files
for file in "$DIR"/*; do
  [ -f "$file" ] || continue

  ext="${file##*.}"
  ext=$(echo "$ext" | tr '[:upper:]' '[:lower:]')  # normalize lowercase

  target_dir="Others"  # default group

  if in_array "$ext" "${photos[@]}"; then
    target_dir="Media/Photos"
  elif in_array "$ext" "${videos[@]}"; then
    target_dir="Media/Videos"
  elif in_array "$ext" "${documents[@]}"; then
    target_dir="Documents"
  elif in_array "$ext" "${compressed[@]}"; then
    target_dir="Compressed"
  elif in_array "$ext" "${audio[@]}"; then
    target_dir="Media/Audio"
  fi

  mkdir -p "$DIR/$target_dir"

  # Generate new filename if already exists
  base_name="$(basename "$file")"
  dest="$DIR/$target_dir/$base_name"

  if [ -e "$dest" ]; then
      name="${base_name%.*}"
      ext_only="${base_name##*.}"
      n=1
      while [ -e "$DIR/$target_dir/${name}_$n.$ext_only" ]; do
          ((n++))
      done
      dest="$DIR/$target_dir/${name}_$n.$ext_only"
  fi

  mv "$file" "$dest"
  echo "Moved: $(basename "$file") → $target_dir/$(basename "$dest")"
done
