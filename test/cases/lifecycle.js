import React from "react";

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

		this.UNSAFE_componentWillMount = logger('outer componentWillMount');
		this.componentDidMount = logger('outer componentDidMount');
		this.UNSAFE_componentWillReceiveProps = logger(
			'outer componentWillReceiveProps',
		);
		this.shouldComponentUpdate = logger('outer shouldComponentUpdate');
		this.UNSAFE_componentWillUpdate = logger('outer componentWillUpdate');
		this.componentDidUpdate = logger('outer componentDidUpdate');
		this.componentWillUnmount = logger('outer componentWillUnmount');
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

		this.UNSAFE_componentWillMount = logger('inner componentWillMount');
		this.componentDidMount = logger('inner componentDidMount');
		this.UNSAFE_componentWillReceiveProps = logger(
			'inner componentWillReceiveProps',
		);
		this.shouldComponentUpdate = logger('inner shouldComponentUpdate');
		this.UNSAFE_componentWillUpdate = logger('inner componentWillUpdate');
		this.componentDidUpdate = logger('inner componentDidUpdate');
		this.componentWillUnmount = logger('inner componentWillUnmount');
	}
	render() {
		return <span>{this.props.x}</span>;
	}
}
