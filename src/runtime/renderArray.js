import renderInternal from "./renderInternal";

const ARRAY_MARKER = {};

export const KeySymbol = Symbol();

export default (context, array) => {
	if (context._ !== ARRAY_MARKER) {
		if (context.$) context.$();

		// Clear the context to not be influenced by old data
		for (let key in context) {
			if (Object.prototype.hasOwnProperty.call(context, key) && key !== "$$") {
				context[key] = undefined;
			}
		}

		context.$ = () => {
			const oldItems = context.items;
			if (oldItems) {
				for (let i = 0; i < oldItems.length; i++) {
					const itemContext = oldItems[i].context;
					if (itemContext.$) itemContext.$();
				}
			}
		};
		context._ = ARRAY_MARKER;
	}

	const oldItems = context.items;
	const oldNodeMap = context.nodeMap;
	const fragment = (context.fragment = context.fragment || []);
	const keys = new Set();
	const nodeMap = new Map();
	context.items = array.map((item, i) => {
		const key = KeySymbol in item ? `key[${item[KeySymbol]}]` : `item${i}`;
		renderInternal(context, item, key, false);
		const node = context[key];
		keys.add(key);
		nodeMap.set(node, i);
		return {
			key,
			node,
			context: context[key + "_"]
		};
	});
	context.nodeMap = nodeMap;

	// Run unmount on removed items
	if (oldItems) {
		for (let i = 0; i < oldItems.length; i++) {
			const item = oldItems[i];
			if (!keys.has(item.key)) {
				if (item.context.$) item.context.$();
			}
		}
	}

	// update fragment (and DOM) to new structure
	const marker = context.items.length === 0 && document.createComment("RAWACT");
	const last = fragment[fragment.length - 1];
	const followingNode = last && last.nextSibling;
	const parentNode = last && last.parentNode;
	let i = 0;
	let offset = 0;
	while (true) {
		const goalNode =
			i === 0 && marker
				? marker
				: i < context.items.length
				? context.items[i].node
				: null;
		const currentNode = fragment[i];

		// Figure out where the currentNode should be instead
		const currentNodeTarget = nodeMap.get(currentNode);

		if (currentNodeTarget < i) {
			// This node was already moved
			// It's important to fix the offset here
			// This can't be done while moving
			fragment.splice(i, 1);
			offset--;
			continue;
		}

		// Equal great, continue with next one
		if (goalNode && goalNode === currentNode) {
			i++;
			continue;
		}

		if (goalNode && !goalNode.isConnected) {
			// This is a new node
			if (currentNode) {
				if (parentNode) {
					parentNode.insertBefore(goalNode, currentNode);
				}
			} else {
				if (parentNode) {
					if (followingNode) {
						parentNode.insertBefore(goalNode, followingNode);
					} else {
						parentNode.appendChild(goalNode);
					}
				}
			}
			fragment.splice(i, 0, goalNode);
			offset++;
			i++;
			continue;
		}

		// When reached the end of the fragment
		// goalNode must already be null here
		if (!currentNode) break;

		if (currentNodeTarget === undefined) {
			// This node is no longer needed and can be removed
			if (parentNode) parentNode.removeChild(currentNode);
			fragment.splice(i, 1);
			offset--;
			continue;
		}

		// goalNode must be set here
		if (!goalNode) {
			throw Error("Can't happen!");
		}

		// Figure out where the goalNode is currently
		// As we already did some inserting and deleting
		// offset has tracked that
		const goalNodeSource = oldNodeMap.get(goalNode) + offset;
		// Check which one is nearer
		// The goalNode source or the currentNode target
		if (goalNodeSource < currentNodeTarget) {
			// The source is nearer:
			// remove the current node
			// to be later inserted again
			if (parentNode) parentNode.removeChild(currentNode);
			fragment.splice(i, 1);
			offset--;
		} else {
			// The currectNode target is nearer:
			// move the goal node before the current node
			if (parentNode) parentNode.insertBefore(goalNode, currentNode);
			fragment.splice(i, 0, goalNode);
			offset++;
			i++;
		}
	}
	return fragment;
};
