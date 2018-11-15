import createText from "./createText";
import { runEffects } from "./effects";
import renderArray from "./renderArray";
import toText from "./toText";
import replaceNode from "./replaceNode";

const renderInstructions = (
	context,
	value,
	property,
	childContext,
	initialRender,
	rerender
) => {
	const old = !initialRender && context[property];
	const node = (context[property] = value(childContext, rerender));
	if (old) {
		replaceNode(old, node);
	}
};

const renderInternal = (context, value, property, initialRender) => {
	// Check if value changed
	const slot2 = property + "$";
	if (!initialRender && context[slot2] === value) return;
	context[slot2] = value;

	// Slot for child context
	const slot = property + "_";

	let node;
	if (typeof value === "function") {
		// render instructions
		if (initialRender || !context[slot]) {
			context[slot] = { $$: context.$$ };
		}
		const rerender = () => {
			if (context[slot2] === value) {
				const old = context[property];
				const node = (context[property] = value(context[slot], rerender));
				replaceNode(old, node);
				runEffects();
			}
		};
		node = value(context[slot], rerender);
	} else {
		if (Array.isArray(value)) {
			// render array
			if (initialRender || !context[slot]) {
				context[slot] = { $$: context.$$ };
			}
			node = renderArray(context[slot], value);
		} else {
			// text content
			if (context[slot]) {
				if (!initialRender && context[slot].$) context[slot].$();
				context[slot] = undefined;
			}
			const text = toText(value);
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
	}
	if (!initialRender) {
		const old = context[property];
		if (old) {
			replaceNode(old, node);
		}
	}
	context[property] = node;
};

export default renderInternal;
