import createText from "./createText";

export default items => {
	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		if (typeof item === "string") {
			items[i] = createText(item);
		}
	}
	return items;
};
