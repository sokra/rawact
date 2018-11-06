export default (node, style) => {
	if (typeof style === "string") {
		node.style = style;
	} else if (typeof style === "object") {
		node.style = "";
		for (let key in style) {
			let val = style[key];
			if (typeof val === "number") val = `${val}px`;
			node.style[key] = val;
		}
	}
};
