import React from "react";

export const Hello = ({ name }) => <p>Hello {name}!</p>;

export const HelloWorld = () => {
	return (
		<div title={"hello"}>
			<Hello name="World" />
			!
			{'!'}
		</div>
	);
};
