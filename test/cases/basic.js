import React from "react";

const Hello = ({ name }) => <p>Hello {name}!</p>;

const Wrapped = () => {
	return (
		<div title={"hello"}>
			<Hello name="World" />
			!!
		</div>
	);
};

describe('basic', () => {
	it('renders correctly', () => {
		const element = document.createElement('div');

		const component = ReactDOM.render(<Wrapped/>, element);

		expect(element).toMatchSnapshot();
	});
});
