import React, { useState } from "react";
import Counter from "./Counter";

export default () => {
	const [step, setStep] = useState(1);
	return (
		<div>
			<Counter step={step} />
			<button
				onClick={() => {
					setStep(step + 1);
				}}
			>
				step + 1
			</button>
		</div>
	);
};
