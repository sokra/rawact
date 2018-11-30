import React from "react";

export const Hello = ({ name }) => <React.Fragment>Hello {name}!</React.Fragment>;
export const GoodBye = ({ name }) => <React.Fragment>Good<b>B</b>ye {name}!</React.Fragment>;

export const ChangingChildren = ({ type, name }) => {
	const children = [type === 'hello' ? <Hello name={name}/> : <GoodBye name={name}/>];
	if(type === 'goodbye') {
		children.push('(and sorry)');
	}
	return <React.Fragment>
		{children}
	</React.Fragment>;
};

export const ChangingChildrenElement = ({ isDiv }) => {
	return <React.Fragment>
		Testing...
		{isDiv ? <div/> : <span/>}
	</React.Fragment>;
};

