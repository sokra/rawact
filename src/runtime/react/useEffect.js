import { createSlot, addCleanup } from "../hooks";
import { addEffect } from "../effects";
import compareDependencies from "../compareDependencies";

export default (handler, dependencies) => {
	const [hooks, index] = createSlot();
	const token = {};
	if (!hooks[index]) {
		const entry = {
			dependencies,
			cleanup: undefined,
			token
		};
		hooks[index] = entry;
		addEffect(() => {
			if (entry.token !== token) return;
			const cleanup = handler();
			entry.cleanup = cleanup;
		});
		addCleanup(() => {
			if (entry.cleanup) {
				entry.cleanup();
				entry.cleanup = undefined;
			}
		});
	} else {
		const entry = hooks[index];
		if (compareDependencies(dependencies, entry.dependencies)) return;
		entry.dependencies = dependencies;
		entry.token = token;
		if (entry.cleanup) {
			entry.cleanup();
			entry.cleanup = undefined;
		}
		addEffect(() => {
			if (entry.token !== token) return;
			const cleanup = handler();
			entry.cleanup = cleanup;
		});
	}
};
