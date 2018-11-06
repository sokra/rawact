import React from "react";

export default class OldComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value2: 10
		};
	}

	componentDidMount() {
		console.log(`Mounted with ${this.props.value}`);
	}

	componentWillUnmount() {
		console.log(`Will Unmount with ${this.props.value}`);
	}

	componentDidUpdate(oldProps, oldState) {
		console.log(
			`Did update with ${oldProps.value} -> ${this.props.value} and ${
				oldState.value2
			} -> ${this.state.value2}`
		);
	}

	render() {
		const { value, onIncrementValue } = this.props;
		const { value2 } = this.state;

		return (
			<p>
				<span>
					{value} {value2}
				</span>
				<button onClick={onIncrementValue}>prop++</button>
				<button
					onClick={() => {
						this.setState({ value2: value2 + 1 });
					}}
				>
					state++
				</button>
			</p>
		);
	}
}
