import renderInternal from "./renderInternal";

const ARRAY_MARKER = {};

export const KeySymbol = Symbol();

export default (context, array) => {
	if (context._ !== ARRAY_MARKER) {
		if (context.$) context.$();
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
	const fragment = document.createDocumentFragment();
	const keys = new Set();
	context.items = array.map((item, i) => {
		const key = KeySymbol in item ? `key[${item[KeySymbol]}]` : `item${i}`;
		renderInternal(context, item, key, false);
		const node = context[key];
		keys.add(key);
		fragment.appendChild(node);
		return {
			key,
			node,
			context: context[key + "_"]
		};
	});
	if (oldItems) {
		for (const item of oldItems) {
			if (!keys.has(item.key)) {
				if (item.context.$) item.context.$();
			}
		}
	}
	return fragment;
};
