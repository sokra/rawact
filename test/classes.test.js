import React from "react";
import ReactDOM from "react-dom";
import * as Classes from './cases/classes';
import renderHelper from "./renderHelper";

describe('classes', () => {
	it('renders correctly', () => {
		const { rendered } = renderHelper(<Classes.Hello name="world"/>);

		expect(rendered).toMatchSnapshot();
	});

	it('pure components protect multiple re-renders', () => {
		const { element } = renderHelper(<Classes.RenderCountingPure name="world"/>);

		ReactDOM.render(<Classes.RenderCountingPure name="world"/>, element);
		let rendered = ReactDOM.render(<Classes.RenderCountingPure name="world"/>, element);
		expect(rendered).toMatchSnapshot();

		rendered = ReactDOM.render(<Classes.RenderCountingPure name="me"/>, element);
		expect(rendered).toMatchSnapshot();
	});

	xit('unmounts', () => {
		const { element } = renderHelper(<Classes.Hello name="world"/>);

		ReactDOM.unmountComponentAtNode(element);

		expect(rendered).toMatchSnapshot();
	});

	it('unmounts when changing componnt', () => {
		const { element } = renderHelper(<Classes.Hello name="world"/>);

		ReactDOM.render(<div>No class any more</div>, element);

		expect(element).toMatchSnapshot();
	});
});
