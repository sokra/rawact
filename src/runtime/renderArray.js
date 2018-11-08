import renderInternal from "./renderInternal";

const ARRAY_MARKER = {};

export const KeySymbol = Symbol();

export default (context, array) => {
	if (context._ !== ARRAY_MARKER) {
		if (context.$) context.$();
		for (const key of Object.keys(context)) context[key] = undefined;
		context.$ = () => {
			const oldItems = context.items;
			if (oldItems) {
				for (const item of oldItems) {
					if (item.context.$) item.context.$();
				}
			}
		};
		context._ = ARRAY_MARKER;
	}

	const oldItems = context.items;
	const fragment = (context.fragment =
		context.fragment && context.fragment.length > 0 ? context.fragment : []);
	const keys = new Set();
	context.items = array.map((item, i) => {
		const key = KeySymbol in item ? `key[${item[KeySymbol]}]` : `item${i}`;
		renderInternal(context, item, key, false);
		const node = context[key];
		keys.add(key);
		const nodeAtIndex = fragment[i];
		if (nodeAtIndex !== node) {
			if (nodeAtIndex) {
				if (nodeAtIndex.parentNode)
					nodeAtIndex.parentNode.insertBefore(node, nodeAtIndex);
				fragment.splice(i, 0, node);
			} else {
				const last = fragment[fragment.length - 1];
				if (last && last.parentNode) {
					if (last.nextSibling) {
						last.parentNode.insertBefore(node, last.nextSibling);
					} else {
						last.parentNode.appendChild(node);
					}
				}
				fragment.push(node);
			}
		}
		return {
			key,
			node,
			context: context[key + "_"]
		};
	});
	const len = array.length;
	while (fragment.length > len) {
		const node = fragment.pop();
		if (node.parentNode) node.parentNode.removeChild(node);
	}
	if (oldItems) {
		for (const item of oldItems) {
			if (!keys.has(item.key)) {
				if (item.context.$) item.context.$();
			}
		}
	}
	return fragment;
};
