import React from "react";
import ReactDOM from "react-dom";

const Hello = ({ name }) => <p>Hello {name}!</p>;

const Wrapped = () => {
	return (
		<div title={"hello"}>
			<Hello name="World" />
			!
			{'!'}
		</div>
	);
};

describe('basic', () => {
	it('renders correctly', () => {
		const element = document.createElement('div');

		const elementRendered = ReactDOM.render(<Wrapped/>, element);

		expect(element).toMatchSnapshot();
		expect(elementRendered).toEqual(element.childNodes[0]);
	});
});
