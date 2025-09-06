#!/bin/bash

# Paths
CAVA_CONFIG="$HOME/.config/cava/config"
WAL_COLORS="$HOME/.cache/wal/colors.json"

# Take colors from pywal
COLOR1=$(jq -r '.colors.color8' "$WAL_COLORS")
COLOR2=$(jq -r '.colors.color1' "$WAL_COLORS")

# Update colors in CAVA
sed -i "s|^gradient_color_1 = '.*'|gradient_color_1 = '$COLOR1'|" "$CAVA_CONFIG"
sed -i "s|^gradient_color_2 = '.*'|gradient_color_2 = '$COLOR2'|" "$CAVA_CONFIG"

# Auto-Restart CAVA (if it's running)
killall -USR1 cava