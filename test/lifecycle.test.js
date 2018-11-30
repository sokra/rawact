import React from "react";
import ReactDOM from "react-dom";
import * as Lifecycle from './cases/lifecycle';
import renderHelper from "./renderHelper";

describe('lifecycle', () => {

	// TODO: Test take from react's own test suite.
	// missing methods are commented out, test disabled because
	// they also occur in the wrong order
	xit('calls in the right outer', () => {
		const { element } = renderHelper(<Lifecycle.Outer x={1} />);
		expect(Lifecycle.getLogMessages()).toEqual([
//			'outer componentWillMount',
//			'inner componentWillMount',
			'inner componentDidMount',
			'outer componentDidMount',
		]);

		ReactDOM.render(<Lifecycle.Outer x={2} />, element);
		expect(Lifecycle.getLogMessages()).toEqual([
//			'outer componentWillReceiveProps',
			'outer shouldComponentUpdate',
//			'outer componentWillUpdate',
//			'inner componentWillReceiveProps',
			'inner shouldComponentUpdate',
//			'inner componentWillUpdate',
			'inner componentDidUpdate',
			'outer componentDidUpdate',
		]);

		// TODO - when unmount is supported
		// ReactDOM.unmountComponentAtNode(container);
		ReactDOM.render(<div/>, element);

		expect(Lifecycle.getLogMessages()).toEqual([
			'outer componentWillUnmount',
			'inner componentWillUnmount',
		]);
	});
});
