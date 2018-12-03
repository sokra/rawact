import React from "react";
import ReactDOM from "react-dom";
import renderHelper from "./renderHelper";

let log = [];
const logger = function(msg) {
	return function() {
		// return true for shouldComponentUpdate
		log.push(msg);
		return true;
	};
};

export const getLogMessages = () => {
	const returnedLog = log;
	log = [];
	return returnedLog;
};

export class Outer extends React.Component {
	constructor() {
		super();

		this.componentDidMount = logger("outer componentDidMount");
		this.shouldComponentUpdate = logger("outer shouldComponentUpdate");
		this.componentDidUpdate = logger("outer componentDidUpdate");
		this.componentWillUnmount = logger("outer componentWillUnmount");
	}
	render() {
		return (
			<div>
				<Inner x={this.props.x} />
			</div>
		);
	}
}

class Inner extends React.Component {
	constructor() {
		super();

		this.componentDidMount = logger("inner componentDidMount");
		this.shouldComponentUpdate = logger("inner shouldComponentUpdate");
		this.componentDidUpdate = logger("inner componentDidUpdate");
		this.componentWillUnmount = logger("inner componentWillUnmount");
	}
	render() {
		return <span>{this.props.x}</span>;
	}
}

describe("lifecycle", () => {
	// TODO: test disabled because they occur in the wrong order
	xit("calls in the right outer", async () => {
		const element = await renderHelper(<Outer x={1} />);
		expect(getLogMessages()).toEqual([
			"inner componentDidMount",
			"outer componentDidMount"
		]);

		renderHelper(<Outer x={2} />, element);
		expect(getLogMessages()).toEqual([
			"outer shouldComponentUpdate",
			"inner shouldComponentUpdate",
			"inner componentDidUpdate",
			"outer componentDidUpdate"
		]);

		// TODO - when unmount is supported
		// ReactDOM.unmountComponentAtNode(container);
		renderHelper(<div />, element);

		expect(getLogMessages()).toEqual([
			"outer componentWillUnmount",
			"inner componentWillUnmount"
		]);
	});
});
