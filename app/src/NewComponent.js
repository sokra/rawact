import React, { useState, useEffect } from "react";

export default ({ value, onIncrementValue }) => {
	const [value2, setValue2] = useState(10);

	useEffect(() => {
		console.log(`effect triggered for ${value} and ${value2}`);
		return () => {
			console.log(`effect removed for ${value} and ${value2}`);
		};
	});

	useEffect(
		() => {
			console.log(`conditional effect triggered for ${value}`);
			return () => {
				console.log(`conditional effect removed for ${value}`);
			};
		},
		[value]
	);

	return (
		<p>
			<span>
				{value} {value2}
			</span>
			<button onClick={onIncrementValue}>prop++</button>
			<button
				onClick={() => {
					setValue2(value2 + 1);
				}}
			>
				state++
			</button>
		</p>
	);
};
