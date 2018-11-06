import { getComponent } from "../hooks";

export default context => {
	let comp = getComponent();
	const symbol = context.symbol;
	do {
		if (symbol in comp) {
			return comp[symbol];
		}
		comp = comp._parent;
	} while (comp);
	return context.defaultValue;
};
