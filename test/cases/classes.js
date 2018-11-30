import React from "react";

export class Hello extends React.Component {
	render() {
		return <p>Hello {this.props.name}!</p>;
	}
}

export class RenderCountingPure extends React.PureComponent {
	constructor() {
		super();
		this.count = 0;
	}
	render() {
		return <p>Hi to {this.props.name} x{++this.count}</p>;
	}
}
