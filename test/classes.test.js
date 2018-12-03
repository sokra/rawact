import React from "react";
import ReactDOM from "react-dom";
import renderHelper from "./renderHelper";

class Hello extends React.Component {
	render() {
		return <p>Hello {this.props.name}!</p>;
	}
}

class RenderCountingPure extends React.PureComponent {
	constructor() {
		super();
		this.count = 0;
	}
	render() {
		return (
			<p>
				Hi to {this.props.name} x{++this.count}
			</p>
		);
	}
}

describe("classes", () => {
	it("renders correctly", async () => {
		const element = await renderHelper(<Hello name="world" />);

		expect(element).toMatchSnapshot();
	});

	it("pure components protect multiple re-renders", async () => {
		const element = await renderHelper(<RenderCountingPure name="world" />);

		renderHelper(<RenderCountingPure name="world" />, element);
		renderHelper(<RenderCountingPure name="world" />, element);
		expect(element).toMatchSnapshot();

		renderHelper(<RenderCountingPure name="me" />, element);
		expect(element).toMatchSnapshot();
	});

	xit("unmounts", async () => {
		const element = await renderHelper(<Hello name="world" />);

		ReactDOM.unmountComponentAtNode(element);

		expect(element).toMatchSnapshot();
	});

	it("unmounts when changing componnt", async () => {
		const element = await renderHelper(<Hello name="world" />);

		renderHelper(<div>No class any more</div>, element);

		expect(element).toMatchSnapshot();
	});
});
