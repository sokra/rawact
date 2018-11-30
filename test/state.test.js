import React from "react";
import ReactDOM from "react-dom";
import * as State from './cases/state';
import renderHelper from "./renderHelper";

describe('state', () => {
	it('renders correctly each time state changes', async () => {
		const { rendered } = renderHelper(<State.Hello name="world"/>);

		expect(rendered).toMatchSnapshot();

		State.runTick();
		await Promise.resolve();

		expect(rendered).toMatchSnapshot();

		State.runTick();
		await Promise.resolve();

		expect(rendered).toMatchSnapshot();
	});
});
