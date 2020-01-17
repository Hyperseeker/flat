let container = document.querySelector("main");

Object.defineProperty(Object.prototype, 'pipe', {

	value: function (fn) { return fn(this.valueOf()) },
	writable: true,
	configurable: true,

  });

let Mouse = {

	get clicked () { return Mouse.current.x == Mouse.memory.x && Mouse.current.y == Mouse.memory.y },

	current: {

		x: 0,

		y: 0

	},

	memory: {

		x: 0,

		y: 0

	},

	holding: false,

	state: {

		type:       null,

		target:     null,

		offset:     { x: 0, y: 0 },

		dimensions: { width: 0, height: 0, heightContent: 0 },

		sides:      [],

		reset () {

			let defaultState = {

				type:       null,

				target:     null,

				offset:     { x: 0, y: 0 },

				dimensions: { width: 0, height: 0, heightContent: 0 },

				sides:      []

			};

			Object.assign(Mouse.state, defaultState);

			Mouse.holding = false;
			
		}

	},

	operations: {

		drag () {

			let viewport = document.documentElement.getBoundingClientRect();

			let dragX    = Mouse.current.x - Mouse.state.offset.x,
				dragY    = Mouse.current.y - Mouse.state.offset.y;

			let fullX    = viewport.width  - Mouse.state.dimensions.width,
				fullY    = viewport.height - Mouse.state.dimensions.height;

			let maximumX = Math.min(dragX, fullX),
				maximumY = Math.min(dragY, fullY);

			Mouse.state.target.style.top  = Math.max(maximumY, 0) + "px";
			Mouse.state.target.style.left = Math.max(maximumX, 0) + "px";

		},

		resize () {

			// * makes sure the node is topmost (== last child of container)
			// * topmost node will have highest priority for interactions
			// if (!Mouse.state.target.matches(":last-child")) container.append(Mouse.state.target);

			for (side of Mouse.state.sides) NodeManager.resize[side]();

		}

	}
	
};

let MouseHandler = function (event) {

	Mouse.current.x = event ? event.x : Mouse.current.x;
	Mouse.current.y = event ? event.y : Mouse.current.y;

	if (Mouse.state.type) Mouse.operations[Mouse.state.type]();

	return {

		mousedown (event) {

			let element    = event.target;

			Mouse.holding  = event.buttons == 1;

			Mouse.memory.x = Mouse.current.x;
			Mouse.memory.y = Mouse.current.y;

			// TODO: abstract "loses focus" function
			//    *  to use whenever user clicks away from the current element
			//    ?  current = `NodeManager.safe`?

			// TODO: abstract "goes to top" function
			//    *  to use whenever user clicks on any node or its children

			// * makes sure no node is editable at this stage
			// * if `.content` is `event.target`, it will be the only one editable
			// * else, node loses focus

			NodeManager.resetEditable();

			// # CLICK HANDLING

			if (element == container) {
				
				NodeManager.create();

				// * prevents new node from losing focus
				// * focus given in `.create()`
				event.preventDefault();
			
			};

			if (element.matches(".close")) {

				Mouse.state.type   = "close";
				Mouse.state.target = element.closest(".node");

			}

			if (element.matches(".node")) {

				let style = element.pipe(getComputedStyle);

				Mouse.state.type     = "drag";

				Mouse.state.target   = element;

				Mouse.state.offset.x = event.offsetX;
				Mouse.state.offset.y = event.offsetY;

				Mouse.state.dimensions.width  = style.width.pipe(Number.parseInt);
				Mouse.state.dimensions.height = style.height.pipe(Number.parseInt);

				NodeManager.safe     = Mouse.state.target;

			};

			if (element.matches(".border, .corner")) {

				let [ type, ...sides ] = element.classList;

				Mouse.state.type       = "resize";

				Mouse.state.target     = element.closest(".node");

				Mouse.state.sides      = sides;

				Mouse.state.offset.x   = Mouse.state.target.style.left.pipe(Number.parseInt);
				Mouse.state.offset.y   = Mouse.state.target.style.top.pipe(Number.parseInt);

				if (element.matches(".top, .left")) {

					let style   = Mouse.state.target.pipe(getComputedStyle),
						content = Mouse.state.target.querySelector(".content");
					
					// if (!content.matches(":empty")) {

					let range = document.createRange(),
						rect;

					range.selectNodeContents(content);

					rect = range.getBoundingClientRect();

					Mouse.state.dimensions.heightContent = rect.height;

					console.log(rect.height);

					// };

					Mouse.state.dimensions.width  = style.width.pipe(Number.parseInt);
					Mouse.state.dimensions.height = style.height.pipe(Number.parseInt);

				};

				NodeManager.safe = Mouse.state.target;

			};

			if (element.matches(".content") && Mouse.clicked) {

				element.setAttribute("contenteditable", true);

			};

			// * makes sure the node is topmost (== last child of container)
			// * topmost node will have highest priority for interactions
			if (element.matches(".node:not(:last-child), .node:not(:last-child) *")) container.append(element.closest(".node"));


		},

		mouseup () {

			// * prevents empty nodes from being removed on drag
			if (NodeManager.safe) {

				// TODO: make sure `.content` can be typed in after interactions with `.node`
				//    *  1. `.content` loses editability after interactions
				//    *  2.  caret requires more precise placing:
				//    *      - save caret offset on interaction
				//    *      - set  caret offset on refocus
				NodeManager.safe.querySelector(".content").focus();
			
			};

			if (Mouse.state.type) {

				if (Mouse.state.type == "close" && Mouse.clicked) NodeManager.remove(Mouse.state.target);
				
				Mouse.state.reset();
			
			}

			NodeManager.clean();

		}

	};

};

let NodeManager = {

	// * empty node that's safe from being removed after dragging or resizing
	safe: null,

	create () {

		let node = NodeManager._render();

		container.append(node);

		// * ↓ recomputing styles allows for on-the-flight zoom support

		let border        = node.querySelector(".border.left").pipe(getComputedStyle).width.pipe(Number.parseInt),
			padding       = node.pipe(getComputedStyle).paddingTop.pipe(Number.parseInt),
			spacing       = border + padding * 0.125;

		node.style.top    = Mouse.current.y - (padding * 1.75) + "px";
		node.style.left   = Mouse.current.x - spacing          + "px";

		node.style.width  = 0;
		node.style.height = 0;

		node.querySelector(".content").setAttribute("contenteditable", true);
		node.querySelector(".content").focus();

	},

	remove (node) { node.remove() },

	resize: {

		top () {

			let delta  = Mouse.current.y;

			Mouse.state.target.style.top    = Math.min(Mouse.state.offset.y + Mouse.state.dimensions.height, delta) + "px";
			Mouse.state.target.style.height = Mouse.state.offset.y + Mouse.state.dimensions.height - delta + "px";
	
		},
	
		bottom () {

			Mouse.state.target.style.height = Mouse.current.y - Mouse.state.offset.y + "px";
	
		},
	
		left () {
	
			let delta  = Mouse.current.x;

			Mouse.state.target.style.left  = Math.min(Mouse.state.offset.x + Mouse.state.dimensions.width, delta) + "px";
			Mouse.state.target.style.width = Mouse.state.offset.x + Mouse.state.dimensions.width - delta + "px";
	
		},
	
		right () {

			Mouse.state.target.style.width = Mouse.current.x - Mouse.state.offset.x + "px";
	
		}
	
	},

	_render () { return document.importNode(document.querySelector("template").content.firstElementChild, true) },

	clean () {

		let empties = document.querySelectorAll(".content:empty");

		if (empties) {

			let active = document.activeElement;

			for (empty of empties) {

				let node = empty.closest(".node");

				if (empty != active && node != NodeManager.safe) node.remove();

			};
		
		};
		
	},

	resetEditable () {

		let editables = document.querySelectorAll(`[contenteditable="true"]`);

		for (editable of editables) { editable.setAttribute("contenteditable", false) };

	}

};

document.body.addEventListener("mousemove", MouseHandler);
document.body.addEventListener("mousedown", MouseHandler().mousedown);
document.body.addEventListener("mouseup",   MouseHandler().mouseup);

document.body.addEventListener("keydown", event => {

	let actions = {

		"escape" () {

			document.activeElement.blur();

			NodeManager.resetEditable();

			NodeManager.clean();

		}

	};

	let key = event.key.toLowerCase();

	if (key in actions) {
		
		actions[key]();

		event.preventDefault();
	
	}

});