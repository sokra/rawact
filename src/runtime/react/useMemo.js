import { createSlot } from "../hooks";
import compareDependencies from "../compareDependencies";

export default (factory, dependencies = [factory]) => {
	const [hooks, index] = createSlot();
	if (!hooks[index]) {
		const entry = {
			value: undefined,
			dependencies
		};
		hooks.push(entry);
		entry.value = factory();
		return entry.value;
	} else {
		const entry = hooks[index];
		if (compareDependencies(dependencies, entry.dependencies))
			return entry.value;
		entry.dependencies = dependencies;
		return (entry.value = factory());
	}
};
