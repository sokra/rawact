import React, { useState } from "react";

export default ({ step }) => {
	const [counter, setCounter] = useState(0);
	return (
		<button onClick={() => setCounter(counter + step)}>
			{counter} (+
			{step}) {counter >= 10 ? <h1>🚀</h1> : ""}
		</button>
	);
};
