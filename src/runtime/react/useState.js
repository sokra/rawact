import { createSlot, createScheduleRender } from "../hooks";

export default initialState => {
	const [hooks, index] = createSlot();
	const scheduleRender = createScheduleRender();
	if (!hooks[index]) {
		hooks.push([
			initialState,
			newValue => {
				hooks[index][0] = newValue;
				scheduleRender();
			}
		]);
	}
	return hooks[index];
};
