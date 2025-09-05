local wezterm = require("wezterm")
local config = wezterm.config_builder()

--- Font Settings
config.font_size = 14
config.line_height = 1.2
config.font = wezterm.font("FiraMono Nerd Font")

--- Colors
config.colors = {
	cursor_bg = "white",
	cursor_border = "white",
}

-- Appearance
config.window_decorations = "NONE"
config.hide_tab_bar_if_only_one_tab = true
config.window_padding = {
	left = 0,
	top = 0,
	bottom = 0,
	right = 0,
}

config.window_background_opacity = 0.85

--- Misc
config.max_fps = 60
config.prefer_egl = true

return config
