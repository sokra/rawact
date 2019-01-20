let slots = undefined;
let cleanup = undefined;
let index = undefined;
let currentRerender = undefined;
let currentComponent = undefined;

export function createSlot() {
	return [slots, index++];
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
	const renderMethod = component.prototype[RenderSymbol];
	const render = renderMethod || component;
	return (context, rerender) => {
		if (context._ !== component) {
			context.p = parent;
			context.s = [];
			const compCleanup = (context.c = []);
			if (context.$) context.$();
			context.$ = () => {
				for (const cleanup of compCleanup) {
					cleanup();
				}
				if (context.x.$) context.x.$();
			};
			context._ = component;
			context.x = { $$: context.$$ }; // child context
			context.i = undefined; // instructions
			context.n = undefined; // node
		}
		slots = context.s;
		cleanup = context.c;
		index = 0;
		currentRerender = rerender;
		currentComponent = context;

		const instructions = render.call(currentComponent, props, component);

		if (context.i === instructions) return context.n;

		context.i = instructions;
		return (context.n = instructions(context.x, rerender));
	};
};
