import React from "react";
import ReactDOM from 'react-dom';
import * as Basic from './cases/basic';
import renderHelper from './renderHelper';

describe('basic', () => {
	it('renders correctly', () => {
		const { element, rendered } = renderHelper(<Basic.HelloWorld/>);

		expect(rendered).toMatchSnapshot();
		expect(rendered).toEqual(element.childNodes[0]);
	});

	it('renders updates from render', () => {
		const { element } = renderHelper(<Basic.Hello name="testing"/>);

		const rendered = ReactDOM.render(<Basic.Hello name="world"/>, element);

		expect(rendered).toMatchSnapshot();
	});
});
