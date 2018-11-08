import expandObject from "../expandObject";
import compareDependencies from "../compareDependencies";
import Component from "./Component";
import { RenderSymbol } from "../hooks";

function PureComponent(props) {
	Component.call(this, props);
}
PureComponent.prototype = Object.create(Component.prototype);
PureComponent.prototype.constructor = PureComponent;

const shallowEqual = (a, b) => {
	return compareDependencies(expandObject(a), expandObject(b));
};

PureComponent.prototype.shouldComponentUpdate = function(nextProps, nextState) {
	return (
		!shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState)
	);
};

PureComponent[RenderSymbol] = Component[RenderSymbol];

export { PureComponent as default };
