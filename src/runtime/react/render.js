import { runEffects } from "../effects";
import renderInternal from "../renderInternal";

const flatten = (array) => {
	const flatArray = [];
	for(let i = 0; i < array.length; i++) {
		if (Array.isArray(array[i])) {
			const flattenedChild = flatten(array[i]);
			flatArray.splice(flatArray.length, 0, ...flattenedChild);
		} else {
			flatArray.push(array[i]);
		}
	}
	return flatArray;
};

const replaceArray = (nodes, parentNode) => {
	let shouldReplace = nodes.length !== parentNode.childNodes.length;
	if (!shouldReplace) {
		for(let i = 0; i < nodes.length; i++) {
			if (nodes[i] !== parentNode.childNodes[i]) {
				shouldReplace = true;
				break;
			}
		}
	}
	if (shouldReplace) {
		for(let i = 0; i < nodes.length; i++) {
			parentNode.appendChild(nodes[i]);
		}
		for(let i = nodes.length; i < parentNode.childNodes.length; i++) {
			parentNode.removeChild(parentNode.childNodes[0]);
		}
	}
}

const map = new WeakMap();
export default (element, parentNode) => {
	let context = map.get(parentNode);
	if (!context) {
		map.set(parentNode, (context = { $$: { node: parentNode } }));
	}
	renderInternal(context, element, "node", false);
	let node = context.node;
	if (Array.isArray(node)) {
		const nodes = flatten(node);
		replaceArray(nodes, parentNode);
		node = parentNode.childNodes[0];
	} else {
		if (node.parentElement !== parentNode) parentNode.appendChild(node);
	}
	runEffects();
	return node;
};
