import { createSlot, createScheduleRender } from "../hooks";

export default (reducer, initialState) => {
	const [hooks, index] = createSlot();
	const scheduleRender = createScheduleRender();
	if (!hooks[index]) {
		hooks.push(initialState);
	}
	return [
		hooks[index],
		action => {
			hooks[index] = reducer(hooks[index], action);
			scheduleRender();
		}
	];
};
