#!/bin/bash

# ==== Fastfetch Auto ====

CFG="$HOME/.config/fastfetch/config.jsonc"
FLAG="$HOME/.config/fastfetch/.reload_flag"

clear
tput civis   # hide cursor

# Make sure cursor comes back if script exits
cleanup() {
    tput cnorm
    clear
}
trap cleanup INT TERM EXIT

fastfetch

while true; do
    # check keyboard input (1 char, timeout 1s)
    if read -r -n 1 -t 1 key; then
        if [[ $key == "q" ]]; then
            break
        fi
    fi

    # check config or flag file
    if [ -f "$FLAG" ] || [ "$CFG" -nt "$CFG" ]; then
        clear
        fastfetch
        rm -f "$FLAG"
    fi
done