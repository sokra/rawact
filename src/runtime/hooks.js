let hooks = undefined;
let cleanup = undefined;
let index = undefined;
let currentRerender = undefined;
let currentComponent = undefined;

export function createSlot() {
	return [hooks, index++];
}

export function getComponent() {
	return currentComponent;
}

export function addCleanup(fn) {
	cleanup.push(fn);
}

export function createScheduleRender() {
	const rerender = currentRerender;
	if (!rerender) throw new Error();
	return () => {
		Promise.resolve().then(rerender);
	};
}

export const RenderSymbol = Symbol();

export default (component, props) => {
	const parent = currentComponent;
	return (context, rerender) => {
		if (context._ !== component) {
			context._parent = parent;
			context._hooks = [];
			const compCleanup = (context._cleanup = []);
			if (context.$) context.$();
			context.$ = () => {
				for (const cleanup of compCleanup) {
					cleanup();
				}
			};
			context._ = component;
			context.a = {};
		}
		hooks = context._hooks;
		cleanup = context._cleanup;
		index = 0;
		currentRerender = rerender;
		currentComponent = context;

		const instructions = component[RenderSymbol]
			? component[RenderSymbol](props)
			: component(props);

		hooks = undefined;
		cleanup = undefined;
		index = undefined;
		currentRerender = undefined;
		currentComponent = undefined;

		return instructions(context.a, rerender);
	};
};
