import React from "react";
import ReactDOM from "react-dom";
import renderHelper from "./renderHelper";

const Hello = ({ name }) => <p>Hello {name}!</p>;

const HelloWorld = () => {
	return (
		<div title={"hello"}>
			<Hello name="World" />!{"!"}
		</div>
	);
};

describe("basic", () => {
	it("renders correctly", () => {
		const { element, rendered } = renderHelper(<HelloWorld />);

		expect(rendered).toMatchSnapshot();
		expect(rendered).toEqual(element.childNodes[0]);
	});

	it("renders updates from render", () => {
		const { element } = renderHelper(<Hello name="testing" />);

		const rendered = ReactDOM.render(<Hello name="world" />, element);

		expect(rendered).toMatchSnapshot();
	});

	xit("unmounts", () => {
		const { element } = renderHelper(<Hello name="testing" />);

		ReactDOM.unmountComponentAtNode(element);

		expect(rendered).toMatchSnapshot();
	});
});
