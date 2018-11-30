import React from "react";
import ReactDOM from "react-dom";
import Wrapped from './cases/basic';

describe('basic', () => {
	it('renders correctly', () => {
		const element = document.createElement('div');

		const elementRendered = ReactDOM.render(<Wrapped/>, element);

		expect(element).toMatchSnapshot();
		expect(elementRendered).toEqual(element.childNodes[0]);
	});
});
