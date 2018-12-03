# babel-plugin-rawact

[![Backers on Open Collective](https://opencollective.com/rawact/backers/badge.svg)](#backers)
[![Sponsors on Open Collective](https://opencollective.com/rawact/sponsors/badge.svg)](#sponsors) 

A babel plugin which compiles React.js components into native DOM instructions to eliminate the need for the react library at runtime.

## Motivation

React.js is split into two packages (for in browser usage): react and react-dom.

The react package is a general way to describe components and elements. The react-dom package takes care of rendering these generic elements.

Because of this design react-dom includes code for every possible component/HTMLElement that can be rendered. It also includes code for incremental rendering, scheduling, event handling, etc.

This has an overhead on the initial page load for downloading and evaluating the library.

But there are applications which do not need all these features (at initial page load). For such applications it might make sense to use native DOM operations to build the interactive user interface. A prominent example is Netflix, that removed client-side React.js from the landing page and rebuild interactivity with native DOM code.

This approach is doable, but lacks DX. Writing React.js components is simpler than writing native DOM code.

What if we could transpile React.js components to native DOM operations at build-time? This would eliminate the need for the react library at cost of a bit larger component code.

[Svelte](https://svelte.technology/) has proven that this type of framework-eliminating transpilation can work very well.

## Introducing Rawact

Rawact (raw-react) is a babel plugin which does this transformation.

**State: This is in PROOF OF CONCEPT state. DO NOT USE IT IN PRODUCTION!**

## When does it make sense?

Assuming this tool would make it to a complete and stable tool, it could make sense to use in these cases:

- Small application with total components code < react size
  - Rawact will decrease the total JS size
- Code Splitted application with priority on initial rendering
  - Without loading react the application will bootstrap faster
- Compiling WebComponents from React components
  - You don't want to ship React with your components
- Applications with many component instances which are changing frequently
  - Using direct DOM operations has less overhead than using a framework
- Applications running on low-end devices
  - Using direct DOM operations has less overhead than using a framework

Every application is different. Best measure it to see if it makes sense in your case.

## Usage

```
npm install -D babel-plugin-rawact
```

```
// .babelrc.js
plugins: [
	"rawact"
]
```

Make sure that transpile all modules that contains imports to `react` or `react-dom`. This may include modules in `node_modules` when they ship React.js components.

## Demo application

App: [https://sokra.github.io/todo-mvc-react-hooks-experiments/index.html](https://sokra.github.io/todo-mvc-react-hooks-experiments/index.html)

Repo: [https://github.com/sokra/todo-mvc-react-hooks-experiments](https://github.com/sokra/todo-mvc-react-hooks-experiments)

This is basically the only application working for this proof of concept.

with rawact: 19.8 KiB

with react: 126 KiB

### Demo 2

There is also a demo in the `app/` folder. Install dependencies in root and `app`. Run `yarn build`. Open `index.html`.

There is a performance example which is able to render 10000 non-pure elements a couple of times faster than React.js.

## How does it work?

1. It replaces all imports to `react` and `react-dom` with rawacts own runtime (that's much smaller).
2. It replaces all `React.createElement` calls with DOM rendering instructions. (This includes JSX which is transpiled to `React.createElement`)

### Rendering instructions

rawact has the notation of rendering instructions, which are functions usually called with two arguments `context` and `rerender`. The function is expected to return a native DOM Node or DocumentFragment.

`context` is an plain object which allows to store data between render calls. Similar rendering instructions may use this information in `context` to update an existing DOM Node or DocumentFragment and return this.

`context._` stores a unique token to identify the rendering instruction structure. Rendering instructions use this a marker to identifier "similar" instructions.

`context.$` may stores a function to unmount the current rendering instructions. It's expected to be called when rendering instructions are not "similar" and the old Node can't be used.

Other properties can be used in any way by the rendering instructions.

`rerender` is a function which can be called to trigger a new execution of the rendering instructions (and node update if a new node is returned).

### React.createElement

#### static elements

Input:

```jsx
return <div className="test" />;
```

Annotated output:

```js
// module scope
const instructions = {};

return context => {
	// Check if rendering instructions are "similar"
	if (context._ !== instructions) {
		// Unmount old rendering instructions
		if (context.$) context.$();
		// Set own unmount functions and instructions marker
		context.$ = null;
		context._ = instructions;

		// Create DOM element
		context.a = createElement("div");

		// Set properties
		context.a.className = "test";
	}
	return context.a;
};
```

#### Dynamic attributes

Input:

```jsx
export default ({ test }) => {
	return <div className={test} />;
};
```

Annotated output:

```js
const instructions = {};
export default ({ test }) => {
	// capture current value of attribute
	const _className = test;

	return context => {
		if (context._ !== instructions) {
			if (context.$) context.$();
			context.$ = null;
			context._ = instructions;
			context.a = createElement("div");

			// Store old value in context.b
			context.a.className = context.b = _className;
		} else {
			// Check if className changed, and update it
			if (context.b !== _className)
				context.a.className = context.b = _className;
		}
		return context.a;
	};
};
```

Note: Some attributes generate different code. I. e. `onClick` generates code that adds event handlers.

Note: With the compile step, the update path only has to check dynamic attributes. While React.js itself can't differ between static and dynamic attributes and has to compare all of them.

#### Children

Input:

```jsx
export default ({ test }) => {
	return <div>Hello {test}!</div>;
};
```

Annotated output:

```js
const instructions = {};
export default ({ test }) => {
	// capture current value of children
	const _children_ = test;

	return context => {
		if (context._ !== instructions) {
			if (context.$) context.$();
			context.$ = null;
			context._ = instructions;
			context.a = createElement("div");

			// Render the child, can be text, array or rendering instructions
			// node is stored in context.b
			// child context (when rendering instructions) is stored in context.b_
			// old text value (for comparing) is stored in context.b$
			renderInternal(context, _children, "b", 1);

			// render all the children
			// shortcut for text values
			renderChildren(context.a, ["Hello ", context.b, "!"]);
		} else {
			// Update the child
			// When node changes it's replaced in the parentElement
			renderInternal(context, _children, "b", 0);
		}
		return context.a;
	};
};
```

#### Nested elements

This is an optional optimization, as the code both could already handle nested elements.

Input:

```jsx
export default ({ test }) => {
	return (
		<div>
			<h1>Hello {test}!</h1>
		</div>
	);
};
```

Annotated output:

```js
const instructions = {};
export default ({ test }) => {
	// capture current value of children
	const _children_ = test;

	return context => {
		if (context._ !== instructions) {
			if (context.$) context.$();
			context.$ = null;
			context._ = instructions;
			context.a = createElement("div");
			context.b = createElement("h1");
			renderInternal(context, _children, "c", 1);
			renderChildren(context.b, ["Hello ", context.c, "!"]);
			renderChildren(context.a, [context.b]);
		} else {
			renderInternal(context, _children, "c", 0);
		}
		return context.a;
	};
};
```

#### Components

Input:

```jsx
export default ({ test }) => {
	return <Component prop={test}>Hello</Component>;
};
```

Annotated output:

```js
const instructions = {};
export default ({ test }) => {
	return createComponent(Component, { prop: test, children: "Hello" });
};
```

`createComponent` is a 30 lines function which returns rendering instructions to handle React.js Hooks.

Here the `rerender` argument is used and triggered i. e. by `useState`. `rerender` is usually scheduled (Currently into the next microtask).

The returned rendering instructions run the `Component` (either `render` or the function itself).

For hooks a array per component and a component tree is provided.

`useState` `useReducer` `useEffect` push to this array. `useContext` walks the component tree.

### ReactDOM.render

Rendering a element is now as simple as creating a (singleton per parentNode) `context`, running the rendering instructions, appending/replacing the returned Node and running effects from `useEffect`.

### React.Component

A base class is provided and uses hooks to implement the behavior of instance methods.

## Features and State

- html elements
- attributes (INCOMPLETE: only value, events, style and simple properties)
- ref
- nested elements
- Components
- Arrays
  - key is not implemented
- React.Component (PARTIAL)
  - componentDidMount
  - componentWillUnmount
  - shouldComponentUpdate
  - componentDidUpdate
  - setState
  - this.props
  - this.state
- React.Fragment
- children
  - React.Children is NOT IMPLEMENTED
- useState
- useEffect
- useMemo
- useRef
- useReducer
- React.memo
- React.createContext
- useContext
- ReactDOM.render
- ReadtDOM.unmountComponentAtNode NOT IMPLEMENTED
- dynamic props (PARTIAL: only input with some props)
  - code for all possible props is generated
  - unknown props (i. e. data-xx) is not implemented
- sync rendering

## Future Work

### Suspend & incremental rendering

To support this we need to change the design a bit. Running the Component function need to be separated from applying the update.

It could be implemented by rendering instructions returning a function to update the DOM update.

Input:

```jsx
export default () => {
	return (
		<div>
			<Component />
			<Component />
		</div>
	);
};
```

```jsx
const instructions = {};

export default () => {
	const _child1 = createComponent(Component);
	const _child2 = createComponent(Component);
	return context => {
		const _childRender1 = prepareRenderInternal(context, _child1, "b");
		const _childRender2 = prepareRenderInternal(context, _child2, "c");
		return () => {
			if (context._ !== instructions) {
				if (context.$) context.$();
				context.$ = null;
				context._ = instructions;
				context.a = createElement("div");
				_childRender1(1);
				_childRender2(1);
				renderChildren(context.a, [context.b, context.c]);
			} else {
				_childRender1();
				_childRender2();
			}
		};
	};
};
```

### Merge instructions with unmount

Technically the unmount function only depend on context values. It could be hoisted to module scope and called with `context` argument. The unmount function could then be used as instruction marker, basically merging `context._` and `context.$`.

This could save a few lines of code per component and a function allocation.

Input:

```jsx
export default ({ test }) => {
	return <button onClick={test} />;
};
```

Annotated output:

```js
const unmountAndInstructions = context => {
	removeEventListener(context.a, "click", context.b);
};
export default ({ test }) => {
	const _onClick = test;

	return context => {
		if (context._ !== unmountAndInstructions) {
			if (context._) context._(context);
			context._ = unmountAndInstructions;
			context.a = createElement("button");
			addEventListener(context.a, "click", (context.b = _onClick));
		} else {
			if (context.b !== _onClick)
				replaceEventListener(
					context.a,
					"click",
					context.b,
					(context.b = _onClick)
				);
		}
		return context.a;
	};
};
```

### Server-side rendering

This could be implemented as alternative transpiling mode. This mode would transpile for `renderToString`.

To be able to reuse the DOM created by SSR, we can create JS code on the server to recreate the `context` on the client. This would even work when there is a diff between SSR'd HTML and client-side rendering.

Input:

```jsx
const Component = () => <button />;

export default ({ test }) => {
	return (
		<div className={test}>
			<Component />
		</div>
	);
};
```

Server output:

```js
const instructions = "hr23s";
const instructions2 = "x7fe2";

const Component = () => ssrContext => {
	ssrContext.add("_", JSON.stringify(instructions));
	ssrContext.add("a", ssrContext.node);
	ssrContext.setNodeCount(1);
	return `<button>`;
};

export default ({ test }) => {
	const _className = test;
	const _child = ssrCreateComponent(Component);

	return ssrContext => {
		ssrContext.add("_", JSON.stringify(instructions2));
		ssrContext.add("a", ssrContext.node);
		ssrContext.add("b", JSON.stringify(_className));
		const container = ssrContext.createNodesContainer(
			`${ssrContext.node}.childNodes`
		);
		const childContext = ssrContext.createChildContext(
			container,
			/* node slot */ "c",
			/* context slot */ "c_"
		);
		const childHtml = ssrRenderInternal(childContext, _child);
		ssrContext.setNodeCount(1);
		return `<div class="${escape(_className)}">${childHtml}</div>`;
	};
};
```

Generated HTML: `<div class="test-class-name"><button></div>`

Context emitting this code (`ssrContext.toCode()`):

```js
const SSR_GENERATED_CONTEXT = a => {
	var b, c;
	return {
		_: "x7fe2",
		a: (b = a.childNodes[0]),
		b: "test-class-name",
		c_: {
			_: "hr23s",
			a: (c = b.childNodes[0])
		},
		c: c
	};
};
```

Client bootstrapping:

```js
const mountNode = document.getElementById("root");

// This sets the context for mountNode
React.restoreFromSSR(mountNode, SSR_GENERATED_CONTEXT);

// This will render with the precreated context
// => Will do a update (nop if nothing changed since than)
React.render(<App />, mountNode);
```

### Minimizing generated code size

Some repeated code could be moved into helpers.

Example: All render instruction start with the some code. This could be moved into a helper:

Input:

```jsx
export default ({ test }) => {
	return <div className={test} />;
};
```

Annotated output:

```js
const instructions = {};
export default ({ test }) => {
	const _className = test;

	return context => {
		if (htmlElementInstructions(context, instructions, "div")) {
			context.a.className = context.b = _className;
		} else {
			if (context.b !== _className)
				context.a.className = context.b = _className;
		}
		return context.a;
	};
};
```

Minimized output:

```js
const I={}
export default({test:a})=>c=>(h(c,I,"div")?c.a.className=c.b=a:c.b!==a&&c.a.className=c.b=a,c.a)
```

Pretty minimized output:

```js
const I={}
export default ({ test: a }) => c => (
	h(c, I, "div")
		? c.a.className = c.b = a
		: c.b !== a && c.a.className = c.b = a,
	c.a
)
```

For comparison the component without rawact minimized:

```js
export default ({ test: t }) => a("div", { className: t });
```

## Size of minimal example

```js
import React, { useState } from "react";
import ReactDOM from "react-dom";

const Counter = ({ step }) => {
	const [counter, setCounter] = useState(0);
	return <button onClick={() => setCounter(counter + step)}>{counter}</button>;
};

ReactDOM.render(<Counter step={1} />, document.getElementById("root"));
```

produces a bundle with 4.3 KiB compared to 115 KiB with react and react-dom.

## Contributors

This project exists thanks to all the people who contribute. 
<a href="https://github.com/sokra/rawact/graphs/contributors"><img src="https://opencollective.com/rawact/contributors.svg?width=890&button=false" /></a>


## Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/rawact#backer)]

<a href="https://opencollective.com/rawact#backers" target="_blank"><img src="https://opencollective.com/rawact/backers.svg?width=890"></a>


## Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/rawact#sponsor)]

<a href="https://opencollective.com/rawact/sponsor/0/website" target="_blank"><img src="https://opencollective.com/rawact/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/rawact/sponsor/1/website" target="_blank"><img src="https://opencollective.com/rawact/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/rawact/sponsor/2/website" target="_blank"><img src="https://opencollective.com/rawact/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/rawact/sponsor/3/website" target="_blank"><img src="https://opencollective.com/rawact/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/rawact/sponsor/4/website" target="_blank"><img src="https://opencollective.com/rawact/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/rawact/sponsor/5/website" target="_blank"><img src="https://opencollective.com/rawact/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/rawact/sponsor/6/website" target="_blank"><img src="https://opencollective.com/rawact/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/rawact/sponsor/7/website" target="_blank"><img src="https://opencollective.com/rawact/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/rawact/sponsor/8/website" target="_blank"><img src="https://opencollective.com/rawact/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/rawact/sponsor/9/website" target="_blank"><img src="https://opencollective.com/rawact/sponsor/9/avatar.svg"></a>


