/**
 * @name Hide Channels
 * @author Farcrada
 * @version 2.2.13
 * @description Hide channel list from view.
 *
 * @invite qH6UWCwfTu
 * @website https://github.com/Farcrada/DiscordPlugins
 * @source https://github.com/Farcrada/DiscordPlugins/edit/master/Hide-Channels/HideChannels.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Farcrada/DiscordPlugins/master/Hide-Channels/HideChannels.plugin.js
 */

/** @type {typeof import("react")} */
const React = BdApi.React;

const { Webpack, Webpack: { Filters }, Data, DOM, Patcher } = BdApi,

	config = {
		constants: {
			//The names we need for CSS
			cssStyle: "HideChannelsStyle",
			hideElementsName: "hideChannelElement",
			buttonID: "toggleChannels",
			buttonHidden: "channelsHidden",
			buttonVisible: "channelsVisible",
			avatarOverlap: "avatarOverlap",
			panelsButtonHidden: "panelsButtonHidden"
		}
	};

module.exports = class HideChannels {
	constructor(meta) { config.info = meta; }

	start() {
		try {
			console.log(config)
			//React components for settings
			this.WindowInfoStore = Webpack.getModule(Filters.byKeys("isFocused", "isElementFullScreen"));

			this.KeybindToCombo = Webpack.getModule(Filters.byStrings("numpad plus"), { searchExports: true });
			this.KeybindToString = Webpack.getModule(Filters.byStrings(".join(\"+\")"), { searchExports: true });

			this.FormSwitch = Webpack.getModule(Filters.byStrings('labelRow', 'checked'), { searchExports: true });
			this.FormItem = Webpack.getModule(m => Filters.byStrings('titleId', 'errorId', 'setIsFocused')(m?.render), { searchExports: true });

			//The sidebar to "minimize"/hide
			this.sidebarClass = Webpack.getModule(Filters.byKeys("container", "base")).sidebarList;
			this.headerBarClass = Webpack.getModule(Filters.byKeys("chat", "title")).title;
			this.baseClass = Webpack.getModule(Filters.byKeys("container", "base")).base;
			this.avatarWrapper = Webpack.getModule(Filters.byKeys("avatarWrapper")).avatarWrapper;
			this.panelsButton = Webpack.getModule(Filters.byKeys("avatarWrapper")).buttons;

			//And the keybind
			this.animation = Data.load(config.info.slug, "animation") ?? true;
			this.keybindSetting = this.checkKeybindLoad(Data.load(config.info.slug, "keybind"));
			this.keybind = this.keybindSetting.split('+');

			//Predefine for the eventlistener
			this.currentlyPressed = {};

			this.generateCSS();

			//Render the button and we're off to the races!
			const filter = f => f?.Icon && f.Title,
				modules = Webpack.getModule(m => Object.values(m).some(filter), { first: false });
			for (const module of modules) {
				const HeaderBar = [module, Object.keys(module).find(k => filter(module[k]))];
				this.patchTitleBar(HeaderBar);
			}
		}
		catch (err) {
			try {
				console.error("Attempting to stop after starting error...", err)
				this.stop();
			}
			catch (err) {
				console.error(config.info.name + ".stop()", err);
			}
		}
	}

	getSettingsPanel() {
		//Settings window is lazy loaded so we need to cache this after it's been loaded (i.e. open settings).
		//This also allows for a (delayed) call to retrieve a way to prompt a Form
		if (!this.KeybindRecorder)
			this.KeybindRecorder = Webpack.getModule(m => m.prototype?.cleanUp);

		//Return our keybind settings wrapped in a form item
		return () => {
			const [animation, setanimation] = React.useState(this.animation);

			return [
				React.createElement(this.FormSwitch, {
					value: animation,
					note: "Enable the hide animation. Useful if the animation is \"unstatisfactory\".",
					onChange: (newState) => {
						//Save new state
						this.animation = newState;
						Data.save(config.info.slug, "animation", newState);
						setanimation(newState);

						//Update CSS to reflect new settings.
						this.generateCSS()
					}
				}, "Enable Hide Animation"),
				React.createElement(this.FormItem, {
					//tag: "h5",
					title: "Toggle by keybind:"
				},
					//Containing a keybind recorder.
					React.createElement(this.KeybindRecorder, {
						//The `keyup` and `keydown` events register the Ctrl key different
						//We need to accomodate for that
						defaultValue: this.KeybindToCombo(this.keybindSetting.replace("control", "ctrl")),
						onChange: (e) => {
							//Convert the keybind to current locale
							//Once again accomodate for event differences
							const keybindString = this.KeybindToString(e).toLowerCase().replace("ctrl", "control");

							//Set the keybind and save it.
							Data.save(config.info.slug, "keybind", keybindString);
							//And the keybindSetting
							this.keybindSetting = keybindString;
							this.keybind = keybindString.split('+');
						}
					}))];
		}
	}

	stop() {
		Patcher.unpatchAll(config.info.slug);

		//Our CSS
		DOM.removeStyle(config.constants.cssStyle);

		//And if there are remnants of css left,
		//make sure we remove the class from the sidebar to ensure visual confirmation.
		let sidebar = document.querySelector(`.${this.sidebarClass}`);
		if (sidebar?.classList.contains(config.constants.hideElementsName))
			sidebar.classList.remove(config.constants.hideElementsName);
	}

	/**
	 * @param {object[]} headerBar The module and the export's name (as a string) that contains it
	 */
	patchTitleBar(headerBar) {
		Patcher.before(config.info.slug, ...headerBar, (thisObject, methodArguments, returnValue) => {
			//When elements are being re-rendered we need to check if there actually is a place for us.
			//Along with that we need to check if what we're adding to is an array.
			if (Array.isArray(methodArguments[0]?.children))
				if (methodArguments[0].children.some?.(child =>
					//Make sure we're on the "original" headerbar and not that of a Voice channel's chat, or thread.
					child?.props?.channel ||
					//Group chat
					child?.props?.children?.some?.(child => child?.props?.channel !== undefined) ||
					//The friends page
					child?.type?.Header ||
					//The Nitro page
					child?.props?.children === "Nitro" ||
					//The Shop page
					child?.props?.children?.some?.(child => child?.props?.children === "Shop") ||
					//Home page of certain servers. This is gonna be broken next update, calling it.
					child?.props?.children?.some?.(grandChild => typeof grandChild === 'string')))

					//Make sure our component isn't already present.
					if (!methodArguments[0].children.some?.(child => child?.key === config.info.slug))
						//And since we want to be on the most left of the header bar for style we unshift into the array.
						methodArguments[0].children.unshift?.(React.createElement(this.hideChannelComponent, { key: config.info.slug }));


		});
	}

	/**
	 * React component for our button.
	 * @returns React element
	 */
	hideChannelComponent = () => {
		//Only fetch the sidebar on a rerender.
		const sidebarNode = document.querySelector(`.${this.sidebarClass}`),
			//When a state updates, it rerenders.
			[hidden, setHidden] = React.useState(
				//Check on a rerender where our side bar is so we can correctly reflect this.
				sidebarNode?.classList.contains(config.constants.hideElementsName));
		//Avatar wrapper element
		const sidebarAvatar = document.querySelector(`.${this.avatarWrapper}`);
		const panelsButton = document.querySelector(`.${this.panelsButton}`);

		/**
		 * Use this to make a despensable easy to use listener with React.
		 * @param {string} eventName The name of the event to listen for.
		 * @param {callback} callback Function to call when said event is triggered.
		 * @param {boolean} bubbling Handle bubbling or not
		 * @param {object} [target] The object to attach our listener to.
		 */
		function useListener(eventName, callback, bubbling, target = window) {
			React.useEffect(() => {
				//ComponentDidMount
				target.addEventListener(eventName, callback, bubbling);
				//ComponentWillUnmount
				return () => target.removeEventListener(eventName, callback, bubbling);
			});
		}

		function useWindowChangeListener(windowStore, callback) {
			React.useEffect(() => {
				windowStore.addChangeListener(callback);
				return () => windowStore.removeChangeListener(callback);
			});
		}

		/**
		 * @param {Node} sidebar Sidebar node we want to toggle.
		 * @returns The passed state in reverse.
		 */
		function toggleSidebar(sidebar) {
			/**
			 * Adds and removes our CSS to make our sidebar appear and disappear.
			 * @param {boolean} state State that determines the toggle.
			 * @returns The passed state in reverse.
			 */
			return state => {
				//If it is showing, we need to hide it.
				if (!state) {
					//We hide it through CSS by adding a class.
					sidebar?.classList.add(config.constants.hideElementsName);
					sidebarAvatar?.classList.add(config.constants.avatarOverlap);
					panelsButton?.classList.add(config.constants.panelsButtonHidden);
				} else {
					//If it is hidden, we need to show it.
					sidebar?.classList.remove(config.constants.hideElementsName);
					sidebarAvatar?.classList.remove(config.constants.avatarOverlap);
					panelsButton?.classList.remove(config.constants.panelsButtonHidden);
				}
				return !state;
			};
		}

		//Keydown event
		useListener("keydown", e => {
			//Since we made this an object,
			//we can make new properties with `[]`
			if (e?.key?.toLowerCase)
				this.currentlyPressed[e.key.toLowerCase()] = true;

			//Account for bubbling
		}, true);

		//Keyup event
		useListener("keyup", e => {
			//Check if every currentlyPessed is in our saved keybind.
			if (this.keybind.every(key => this.currentlyPressed[key.toLowerCase()] === true))
				//Toggle the sidebar and rerender on toggle; change the state
				setHidden(toggleSidebar(sidebarNode));

			//Current key goes up, so...
			this.currentlyPressed[e.key.toLowerCase()] = false;

			//Account for bubbling
		}, true);

		//Lose focus event
		useWindowChangeListener(this.WindowInfoStore, () => {
			//Clear when it gets back into focus
			if (this.WindowInfoStore.isFocused())
				this.currentlyPressed = {};
		});

		//Return our element.
		return React.createElement("div", {
			//Styling
			id: config.constants.buttonID,
			//The icon
			className: hidden ? config.constants.buttonHidden : config.constants.buttonVisible,
			//Toggle the sidebar and rerender on toggle; change the state.
			onClick: () => setHidden(toggleSidebar(sidebarNode))
		});
	}

	/**
	 * Checks the given keybind for validity. If not valid returns a default keybind.
	 * @param {String|Array.<number>|Array.<Array.<number>>} keybindToLoad The keybind to filter and load in.
	 * @param {String} [defaultKeybind] A default keybind to fall back on in case of invalidity.
	 * @returns Will return the keybind or return a default keybind.
	 */
	checkKeybindLoad(keybindToLoad, defaultKeybind = "control+h") {
		defaultKeybind = defaultKeybind.toLowerCase().replace("ctrl", "control");

		//If no keybind
		if (!keybindToLoad)
			return defaultKeybind;

		//Error sensitive, so just plump it into a try-catch
		try {
			//If it's already a string, double check it
			if (typeof (keybindToLoad) === typeof (defaultKeybind)) {
				keybindToLoad = keybindToLoad.toLowerCase().replace("control", "ctrl");
				//Does it go into a combo? (i.e.: is it the correct format?)
				if (this.KeybindToCombo(keybindToLoad))
					return keybindToLoad.replace("ctrl", "control");
				else
					return defaultKeybind;
			}
			else
				//If it's not a string, check if it's a combo.
				if (this.KeybindToString(keybindToLoad))
					return this.KeybindToString(keybindToLoad).toLowerCase().replace("ctrl", "control");
		}
		catch (e) { return defaultKeybind; }
	}

	generateCSS() {
		//Check if there is any CSS we have already, and remove it.
		DOM.removeStyle(config.constants.cssStyle);

		//Now inject our (new) CSS
		DOM.addStyle(config.constants.cssStyle, `
/* Button CSS */
#${config.constants.buttonID} {
    min-width: 24px;
    height: 24px;
    background-position: center !important;
    background-size: 100% !important;
    opacity: 0.8;
    cursor: pointer;
}

/* How the button looks */
.theme-dark #${config.constants.buttonID}.${config.constants.buttonVisible} {
    background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiIgd2lkdGg9IjE4cHgiIGhlaWdodD0iMThweCI+PHBhdGggZD0iTTE4LjQxIDE2LjU5TDEzLjgyIDEybDQuNTktNC41OUwxNyA2bC02IDYgNiA2ek02IDZoMnYxMkg2eiIvPjxwYXRoIGQ9Ik0yNCAyNEgwVjBoMjR2MjR6IiBmaWxsPSJub25lIi8+PC9zdmc+) no-repeat;
}
.theme-dark #${config.constants.buttonID}.${config.constants.buttonHidden} {
    background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiIgd2lkdGg9IjE4cHgiIGhlaWdodD0iMThweCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTUuNTkgNy40MUwxMC4xOCAxMmwtNC41OSA0LjU5TDcgMThsNi02LTYtNnpNMTYgNmgydjEyaC0yeiIvPjwvc3ZnPg==) no-repeat;
}
/* In light theme */
.theme-light #${config.constants.buttonID}.${config.constants.buttonVisible} {
    background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzRmNTY2MCIgd2lkdGg9IjE4cHgiIGhlaWdodD0iMThweCI+PHBhdGggZD0iTTE4LjQxIDE2LjU5TDEzLjgyIDEybDQuNTktNC41OUwxNyA2bC02IDYgNiA2ek02IDZoMnYxMkg2eiIvPjxwYXRoIGQ9Ik0yNCAyNEgwVjBoMjR2MjR6IiBmaWxsPSJub25lIi8+PC9zdmc+) no-repeat;
}
.theme-light #${config.constants.buttonID}.${config.constants.buttonHidden} {
    background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzRmNTY2MCIgd2lkdGg9IjE4cHgiIGhlaWdodD0iMThweCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTUuNTkgNy40MUwxMC4xOCAxMmwtNC41OSA0LjU5TDcgMThsNi02LTYtNnpNMTYgNmgydjEyaC0yeiIvPjwvc3ZnPg==) no-repeat;
}

/* Attached CSS to sidebar */
html .${config.constants.hideElementsName}.${config.constants.hideElementsName} {
    width: 0 !important;
}
html .${config.constants.avatarOverlap}.${config.constants.avatarOverlap}{
		z-index: 1;
}
html .${config.constants.panelsButtonHidden}.${config.constants.panelsButtonHidden}{
		display: none !important;
}

/* Don't have square border at top left when channels are hidden */
.${this.baseClass} {
	border-radius: 8px 0 0 !important;
}

/* Set animations */
.${this.sidebarClass} {
    ${this.animation ? "transition: width 400ms ease;" : ""}
	overflow: hidden;
}`);
	}
}
