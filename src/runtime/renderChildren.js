import createText from "./createText";

export default (parentNode, children) => {
	for (const child of children) {
		parentNode.appendChild(
			typeof child === "string" ? createText(child) : child
		);
	}
};
