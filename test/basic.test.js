import React from "react";
import ReactDOM from "react-dom";
import * as Basic from './cases/basic';

describe('basic', () => {
	it('renders correctly', () => {
		const element = document.createElement('div');

		const elementRendered = ReactDOM.render(<Basic.HelloWorld/>, element);

		expect(element).toMatchSnapshot();
		expect(elementRendered).toEqual(element.childNodes[0]);
	});

	it('renders updates from render', () => {
		const element = document.createElement('div');

		ReactDOM.render(<Basic.Hello name="testing"/>, element);
		ReactDOM.render(<Basic.Hello name="world"/>, element);

		expect(element).toMatchSnapshot();
	});
});
