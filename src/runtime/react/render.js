import { runEffects } from "../effects";
import renderInternal from "../renderInternal";

const map = new WeakMap();
export default (element, parentNode) => {
	let context = map.get(parentNode);
	if (!context) {
		map.set(parentNode, (context = { $$: { node: parentNode } }));
	}
	renderInternal(context, element, "node", false);
	const node = context.node;
	if (Array.isArray(node)) {
		let shouldReplace = node.length !== parentNode.childNodes;
		if (!shouldReplace) {
			for(let i = 0; i < node.length; i++) {
				if (node[i] !== parentNode.childNodes[i]) {
					shouldReplace = true;
					break;
				}
			}
		}
		if (shouldReplace) {
			for(let i = 0; i < node.length; i++) {
				parentNode.appendChild(node[i]);
			}
			for(let i = node.length; i < parentNode.childNodes.length; i++) {
				parentNode.removeChild(parentNode.childNodes[0]);
			}
		}
	} else {
		if (node.parentElement !== parentNode) parentNode.appendChild(node);
	}
	runEffects();
	return node;
};
