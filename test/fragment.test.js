import React from "react";
import ReactDOM from "react-dom";
import * as Fragment from './cases/fragment';
import renderHelper from "./renderHelper";

describe('fragments', () => {
	it('renders correctly', () => {
		const { rendered } = renderHelper(<Fragment.Hello name="world"/>);

		expect(rendered).toMatchSnapshot();
	});
});
