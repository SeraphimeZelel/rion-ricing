#!/bin/bash

# Path
WALCSS="$HOME/.cache/wal/colors.css"
BDCSS="$HOME/.config/BetterDiscord/data/stable/custom.css"
TEMPLATE="$HOME/.config/BetterDiscord/bd-template.css"
HEADER="$HOME/.config/BetterDiscord/bd-header.css"

# Overwrite Better Discord Custom CSS using pywal color palette
cat "$HEADER" > "$BDCSS"
echo "" >> "$BDCSS"
cat "$WALCSS" >> "$BDCSS"
echo "" >> "$BDCSS"
cat "$TEMPLATE" >> "$BDCSS"