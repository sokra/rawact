import * as hooks from "../hooks";
import * as effects from "../effects";

function Component(props) {
	this.props = props;
}

Component.prototype[hooks.RenderSymbol] = function(newProps, Class) {
	var [slots, index] = hooks.createSlot();
	var slot = slots[index];
	var instance;
	var stateChanges;
	var shouldUpdate;
	var prevProps;
	var prevState;
	var newState;
	var i;
	if (!slot) {
		stateChanges = [];
		instance = new Class(newProps);
		instance.props = newProps;
		slot = slots[index] = {
			i: instance,
			s: stateChanges,
			u: hooks.createScheduleRender(),
			f: false, // forceRender flag
			r: undefined // rendering instructions
		};
		instance.setState = newState => {
			stateChanges.push(
				typeof newState === "function" ? newState : () => newState
			);
			slot.u();
		};
		instance.forceUpdate = () => {
			slot.f = true;
			slot.u();
		};
		effects.addEffect(() => {
			instance.componentDidMount();
		});
		hooks.addCleanup(() => {
			instance.componentWillUnmount();
		});
		return (slot.r = instance.render());
	} else {
		instance = slot.i;
		slot.u = hooks.createScheduleRender();
		prevProps = instance.props;
		prevState = instance.state;
		stateChanges = slot.s;
		newState = prevState;
		for (i = 0; i < stateChanges.length; i++) {
			newState = Object.assign({}, newState, stateChanges[i](newState));
		}
		stateChanges.length = 0;

		shouldUpdate = slot.f || instance.shouldComponentUpdate(newProps, newState);

		instance.props = newProps;
		instance.state = newState;
		slot.f = false;

		if (shouldUpdate) {
			effects.addEffect(() => {
				instance.componentDidUpdate(prevProps, prevState);
			});

			slot.r = instance.render();
		}

		return slot.r;
	}
};

Component.prototype.shouldComponentUpdate = () => true;
Component.prototype.componentDidUpdate = () => {};
Component.prototype.componentWillUnmount = () => {};
Component.prototype.componentDidMount = () => {};

export { Component as default };
