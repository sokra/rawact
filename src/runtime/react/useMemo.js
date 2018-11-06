import { createSlot } from "../hooks";
import compareDependencies from "../compareDependencies";

export default (factory, dependencies = [factory]) => {
	const [hooks, index] = createSlot();
	if (!hooks[index]) {
		const entry = {
			value: factory(),
			dependencies
		};
		hooks.push(entry);
		return entry.value;
	} else {
		const entry = hooks[index];
		if (compareDependencies(dependencies, entry.dependencies))
			return entry.value;
		return (entry.value = factory());
	}
};
