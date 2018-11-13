import { createSlot } from "../hooks";

export default initialValue => {
	const [hooks, index] = createSlot();
	if (!hooks[index]) {
		const ref = value => {
			ref.current = value;
		};
		ref.current = initialValue;
		hooks.push(ref);
		return ref;
	}
	return hooks[index];
};
