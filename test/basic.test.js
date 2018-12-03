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
	it("renders correctly", async () => {
		const element = await renderHelper(<HelloWorld />);

		expect(element).toMatchSnapshot();
	});

	it("renders updates from render", async () => {
		const element = await renderHelper(<Hello name="testing" />);

		await renderHelper(<Hello name="world" />, element);

		expect(element).toMatchSnapshot();
	});

	xit("unmounts", async () => {
		const element = await renderHelper(<Hello name="testing" />);

		ReactDOM.unmountComponentAtNode(element);

		expect(element).toMatchSnapshot();
	});
});
