import renderInternal from "./renderInternal";

const ARRAY_MARKER = {};

export const KeySymbol = Symbol();

export default (context, array) => {
	const $$ = context.$$;
	if (context._ !== ARRAY_MARKER) {
		if (context.$) context.$();

		context.$ = () => {
			for (const itemContext of context.ctxs.values()) {
				if (itemContext.$) itemContext.$();
			}
			const ctxsNonKey = context.ctxsNonKey;
			for (let i = 0; i < ctxsNonKey.length; i++) {
				const itemContext = ctxsNonKey[i];
				if (itemContext.$) itemContext.$();
			}
		};
		context._ = ARRAY_MARKER;

		context.ctxs = new Map();
		context.ctxsNonKey = [];
		context.nodeMap = undefined;
		context.fragment = [];
	}

	const ctxs = context.ctxs;
	const oldNodeMap = context.nodeMap;
	const fragment = context.fragment;
	const keys = new Set();
	const nodeMap = new Map();
	const keysArray = array.map(item => {
		const key = item[KeySymbol];
		keys.add(key);
		return key;
	});
	const unused = context.ctxsNonKey;
	const ctxsNonKey = (context.ctxsNonKey = []);
	for (const pair of ctxs) {
		if (!keys.has(pair[0])) {
			unused.push(pair[1]);
			ctxs.delete(pair[0]);
		}
	}
	let unusedIndex = 0;
	let isNodeKept = false;
	const items = array.map((item, i) => {
		const key = keysArray[i];
		let childContext;
		if (key === undefined) {
			if (unusedIndex < unused.length) {
				childContext = unused[unusedIndex++];
			} else {
				childContext = { $$ };
			}
			ctxsNonKey.push(childContext);
		} else {
			childContext = ctxs.get(key);
			if (childContext === undefined) {
				childContext = { $$ };
				ctxs.set(key, childContext);
			}
		}
		const oldNode = childContext.a;
		renderInternal(childContext, item, "a", false);
		const node = childContext.a;
		if (oldNode === node) isNodeKept = true;
		nodeMap.set(node, i);
		return node;
	});
	context.nodeMap = nodeMap;

	// Run unmount on removed items
	for (; unusedIndex < unused.length; unusedIndex++) {
		const childContext = unused[unusedIndex];
		if (childContext.$) childContext.$();
	}

	// take shortcuts for clearing all items
	if (items.length === 0) {
		return (context.fragment = [document.createComment("RAWACT")]);
	} else if (!isNodeKept) {
		return (context.fragment = items);
	}

	// update fragment (and DOM) to new structure
	const last = fragment[fragment.length - 1];
	const followingNode = last && last.nextSibling;
	const parentNode = last && last.parentNode;
	let i = 0;
	let offset = 0;
	while (true) {
		const goalNode = i < items.length ? items[i] : null;
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
