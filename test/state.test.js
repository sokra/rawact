import React from "react";
import renderHelper from "./renderHelper";

const ticks = [];

const runTick = () => {
	ticks.shift()();
};

class Hello extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			name: this.props.name,
			count: 1
		};

		ticks.push(() => {
			this.setState({
				count: 2
			});
		});

		ticks.push(() => {
			this.setState(currentState => {
				return {
					count: currentState.count + 1
				};
			});
		});
	}

	render() {
		return (
			<p>
				Hello {this.state.name}! Called x{this.state.count}
			</p>
		);
	}
}

describe("state", () => {
	it("renders correctly each time state changes", async () => {
		const { rendered } = renderHelper(<Hello name="world" />);

		expect(rendered).toMatchSnapshot();

		runTick();
		await Promise.resolve();

		expect(rendered).toMatchSnapshot();

		runTick();
		await Promise.resolve();

		expect(rendered).toMatchSnapshot();
	});
});
