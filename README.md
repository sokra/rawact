# babel-plugin-rawact

A babel plugin with compiles React.js components into native DOM instructions to eliminate the need to the react library at runtime.

## Motivation

React.js is split into two packages (for in browser usage): react and react-dom.

The react package is a general way to descript components and element. The react-dom package takes care of rendering these generic elements.

Because of this design react-dom includes code for every possible component/HTMLElement that can be rendered. It also includes code for incremental rendering, scheduling, event handling, etc.

This has an overhead on the initial page load for downloading and evaluating the library.

But there are applications which do not need all these features (at initial page load). For such applications it might make sense to use native DOM operations to build the interactive user interface. A prominent example is Netfix, that removed client-side React.js from the landing page and rebuild interactivity with native DOM code.

This approach is doable, but leaks DX. Writing React.js components is simpler that write native DOM code.

What if we could transpile React.js components to native DOM operations at build-time? This would eliminate the need for the react library at cost of a bit larger component code.

## Introducing Rawact

Rawact (raw-react) is a babel plugin which does this transformation.

State: This is in PROOF OF CONCEPT state. DO NOT USE IT IN PRODUCTION!

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

App: [https://sokra.github.io/todo-mvc-react-hooks-experiments](https://sokra.github.io/todo-mvc-react-hooks-experiments)

Repo: [https://github.com/sokra/todo-mvc-react-hooks-experiments](https://github.com/sokra/todo-mvc-react-hooks-experiments)

This is basically the only application working for this proof of concept.

with rawact: 18.3 KiB

with react: 126 KiB

## How does it work?

1. It replaces all imports to `react` and `react-dom` with rawacts own runtime (that's much smaller).
2. It replaces all `React.createElement` calls with DOM rendering instructions. (This includes JSX which is transpiled to `React.createElement`)

### Rendering instructions

rawact has the notation of rendering instructions, which are functions usually called with two arguments `context` and `rerender`. The function is expected to return a native DOM Node or DocumentFragment.

`context` is an plain object which allows to store data between render calls. Similar rendering instructions may use this information in `context` to update an existing DOM Node or DocumentFragment and return this.

`context._` stores a unique token to identify the rendering instruction structure. Rendering instructions use this a marker to identifier "similar" instructions.

`context.$` may stores a function to unmount the current rendering instructions. It's expected to be called when rendering instructions are not "similar" and the old Node can't be used.

Other properties can be used in any way by the rendering instructions.

`rerender` is a function which can be called to trigger a new execution of the rendering instructions (and node update if a new node is retured).

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
- dynamic props (PARTIAL: only input with some props)
  - code for all possible props is generated
  - unknown props (i. e. data-xx) is not implemented
- sync rendering
