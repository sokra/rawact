import { runEffects } from "../effects";
import renderInternal from "../renderInternal";
import replaceNode, { toArray } from "../replaceNode";

const map = new WeakMap();
export default (element, parentNode, callback) => {
	let context = map.get(parentNode);
	if (!context) {
		map.set(parentNode, (context = { $$: { node: parentNode } }));
	}
	renderInternal(context, element, "node", false);
	let node = context.node;
	if (Array.isArray(node)) {
		if (parentNode.childNodes.length > 0) {
			replaceNode(parentNode.childNodes, node);
		} else {
			const newNodes = toArray(node);
			for (let i = 0; i < newNodes.length; i++) {
				parentNode.appendChild(newNodes[i]);
			}
		}
	} else {
		if (node.parentElement !== parentNode) parentNode.appendChild(node);
	}
	runEffects();
  if (callback) {
  	callback();
	}
};
