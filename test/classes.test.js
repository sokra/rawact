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
	it("renders correctly", () => {
		const { rendered } = renderHelper(<Hello name="world" />);

		expect(rendered).toMatchSnapshot();
	});

	it("pure components protect multiple re-renders", () => {
		const { element } = renderHelper(<RenderCountingPure name="world" />);

		ReactDOM.render(<RenderCountingPure name="world" />, element);
		let rendered = ReactDOM.render(
			<RenderCountingPure name="world" />,
			element
		);
		expect(rendered).toMatchSnapshot();

		rendered = ReactDOM.render(<RenderCountingPure name="me" />, element);
		expect(rendered).toMatchSnapshot();
	});

	xit("unmounts", () => {
		const { element } = renderHelper(<Hello name="world" />);

		ReactDOM.unmountComponentAtNode(element);

		expect(rendered).toMatchSnapshot();
	});

	it("unmounts when changing componnt", () => {
		const { element } = renderHelper(<Hello name="world" />);

		ReactDOM.render(<div>No class any more</div>, element);

		expect(element).toMatchSnapshot();
	});
});
