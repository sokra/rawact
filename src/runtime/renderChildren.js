import createText from "./createText";
import toText from "./toText";

export default (parentNode, children) => {
	for (const child of children) {
		parentNode.appendChild(
			typeof child === "string" ? createText(toText(child)) : child
		);
	}
};
