import createText from "./createText";
import { runEffects } from "./effects";
import renderArray from "./renderArray";
import toText from "./toText";
import replaceNode from "./replaceNode";

const renderInternal = (context, value, property, initialRender) => {
	const slot = property + "_";
	const slot2 = property + "$";
	const $$ = context.$$;
	if (typeof value === "function") {
		// render instructions
		const render = () => {
			const old = !initialRender && context[property];
			let node;
			if (initialRender || !context[slot]) {
				context[slot] = { $$ };
				context[slot2] = undefined;
			}
			initialRender = false;
			const slotData = context[slot];
			slotData._r = () => {
				render();
				runEffects();
			};
			context[property] = node = value(slotData, () => {
				if (context[slot] === slotData) slotData._r();
			});
			if (old && old !== node) {
				replaceNode(old, node);
			}
		};
		render();
	} else {
		let node;
		if (Array.isArray(value)) {
			// render array
			if (initialRender || !context[slot]) {
				context[slot] = { $$ };
				context[slot2] = undefined;
			}
			node = renderArray(context[slot], value);
		} else {
			// text content
			if (context[slot]) {
				if (!initialRender && context[slot].$) context[slot].$();
				context[slot] = undefined;
				context[slot2] = undefined;
			}
			const text = toText(value);
			if (context[slot2] === text) return;
			context[slot2] = text;
			if (!initialRender) {
				const old = context[property];
				if (old && old.nodeType === 3) {
					// Update text node shortcut
					old.textContent = text;
					return;
				}
			}
			node = createText(text);
		}
		if (!initialRender) {
			const old = context[property];
			if (old && old !== node) {
				replaceNode(old, node);
			}
		}
		context[property] = node;
	}
};

export default renderInternal;
