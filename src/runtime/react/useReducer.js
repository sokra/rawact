import { createSlot, createScheduleRender } from "../hooks";

export default (reducer, initialState) => {
	const [hooks, index] = createSlot();
	const scheduleRender = createScheduleRender();
	if (!hooks[index]) {
		hooks.push([
			initialState,
			action => {
				hooks[index][0] = reducer(hooks[index][0], action);
				scheduleRender();
			}
		]);
	}
	return hooks[index];
};
