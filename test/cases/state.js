import React from "react";

const ticks = [];

export const runTick = () => {
	ticks.shift()();
};

export class Hello extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			name: this.props.name,
			count: 1,
		};

		ticks.push(() => {
			this.setState({
				count: 2,
			})
		});

		ticks.push(() => {
			this.setState((currentState) => {
				return {
					count: currentState.count + 1,
				};
			});
		});
	}

	render() {
		return <p>Hello {this.state.name}! Called x{this.state.count}</p>;
	}
}
