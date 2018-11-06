import React from "react";

const Hello = ({ name }) => <p>Hello {name}!</p>;

export default () => {
	return (
		<div title={"hello"}>
			<Hello name="World" />
			!!
		</div>
	);
};
