import React, { useState } from "react";
import OldComponent from "./OldComponent";
import NewComponent from "./NewComponent";
export default () => {
	const [toggle, setToggle] = useState(true);
	const [valueA, setValueA] = useState(0);
	const [valueB, setValueB] = useState(0);
	return (
		<div>
			<p>
				<input
					type="checkbox"
					checked={toggle}
					onChange={e => setToggle(e.target.checked)}
				/>
			</p>
			{toggle ? (
				<div>
					<h3>OldComponent</h3>
					<OldComponent
						value={valueA}
						onIncrementValue={() => setValueA(valueA + 1)}
					/>{" "}
				</div>
			) : (
				<div>
					<h3>NewComponent</h3>
					<NewComponent
						value={valueB}
						onIncrementValue={() => setValueB(valueB + 1)}
					/>{" "}
				</div>
			)}
		</div>
	);
};
