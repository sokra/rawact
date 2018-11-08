import createText from "./createText";
import toText from "./toText";

const renderChildren = (parentNode, children) => {
	for (const child of children) {
		if (Array.isArray(child)) {
			renderChildren(parentNode, child);
		} else {
			parentNode.appendChild(
				typeof child === "string" ? createText(toText(child)) : child
			);
		}
	}
};

export { renderChildren as default };
