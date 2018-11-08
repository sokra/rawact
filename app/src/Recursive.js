import React, { useState, Fragment } from "react";

export default () => {
	const [text, setText] = useState("Hello World");
	const [count, setCount] = useState(10);
	const [toggle, setToggle] = useState(false);

	return (
		<div>
			<p>
				Text: <input value={text} onChange={e => setText(e.target.value)} />
			</p>
			<p>
				Count:{" "}
				<input
					type="number"
					value={count}
					onChange={e => setCount(e.target.value)}
				/>
			</p>
			<p>
				Unrelated State:{" "}
				<input
					type="checkbox"
					value={toggle}
					onChange={e => setToggle(e.target.checked)}
				/>
			</p>
			<p>
				<Recurse count={count} text={text} index={0} />
			</p>
		</div>
	);
};

const Recurse = ({ text, count, index }) => {
	if (count <= 1)
		return (
			<Fragment>
				{" "}
				{text}
				{index}{" "}
			</Fragment>
		);
	return (
		<Fragment>
			<Recurse text={text} count={Math.floor(count / 2)} index={index} />
			<Recurse
				text={text}
				count={Math.ceil(count / 2)}
				index={index + Math.floor(count / 2)}
			/>
		</Fragment>
	);
};
