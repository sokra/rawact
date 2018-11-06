import { runEffects } from "../effects";
import renderInternal from "../renderInternal";

const map = new WeakMap();
export default (element, parentNode) => {
	let context = map.get(parentNode);
	if (!context) {
		map.set(parentNode, (context = {}));
	}
	renderInternal(context, element, "node", false);
	const node = context.node;
	if (node.parentElement !== parentNode) parentNode.appendChild(node);
	runEffects();
};
