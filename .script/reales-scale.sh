#!/bin/bash

# Path for output
OUTPUT_DIR="$HOME/Pictures/Realesrgan"
REALES="$HOME/.realesrgan/realesrgan-ncnn-vulkan"

# Create output directory if not exists
mkdir -p "$OUTPUT_DIR"

# Default to current directory
INPUT_DIR="$(pwd)"

# Count files (jpg/jpeg/png only)
FILE_COUNT=$(find "$INPUT_DIR" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | wc -l)

# Confirm
read -rp "Initiating RealESRGAN to process $FILE_COUNT files in $INPUT_DIR, are you sure? [y/N]: " confirm
case "$confirm" in
    [yY][eE][sS]|[yY]) ;;
    *) echo "Aborted."; exit 1 ;;
esac

# Model
MODEL="realesr-animevideov3"

# Force NVIDIA GPU (index 1)
GPU_INDEX=1

# Scale options
echo "Choose scale factor:"
echo "1) 2x"
echo "2) 3x"
echo "3) 4x"
read -rp "Select scale (1-3): " scale_choice

case $scale_choice in
    1) SCALE=2 ;;
    2) SCALE=3 ;;
    3) SCALE=4 ;;
    *) echo "Invalid choice, defaulting to 2x"; SCALE=2 ;;
esac

echo "Processing $FILE_COUNT images in $INPUT_DIR with model=$MODEL, scale=${SCALE}x, GPU=$GPU_INDEX..."
COUNT=0

# Process each file
for file in "$INPUT_DIR"/*.{jpg,jpeg,png}; do
    [ -e "$file" ] || continue
    COUNT=$((COUNT + 1))

    filename=$(basename "$file")
    base="${filename%.*}"   # name without extension
    output_file="$OUTPUT_DIR/${base}.png"

    # Ensure no overwrite (add _1, _2, etc.)
    i=1
    while [ -f "$output_file" ]; do
        output_file="$OUTPUT_DIR/${base}_$i.png"
        i=$((i + 1))
    done

    echo "[$COUNT/$FILE_COUNT] Processing: $filename -> $(basename "$output_file")"
    $REALES -i "$file" -o "$output_file" -n "$MODEL" -s "$SCALE" -g "$GPU_INDEX" >/dev/null 2>&1
done

echo "✅ All files processed. Output saved in $OUTPUT_DIR"