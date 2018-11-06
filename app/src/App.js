import React from "react";
import Counter from "./Counter";
import AdvancedCounter from "./AdvancedCounter";
import DynamicProps from "./DynamicProps";
import ToggleSection from "./ToggleSection";
import Recursive from "./Recursive";

export default () => {
	return (
		<div className="App">
			<h1>Rawact</h1>
			<p>
				This application is written for React.js, but doesn't need React.js at
				runtime.
			</p>
			<p style={{ fontWeight: "bold" }}>
				A clever babel plugin compiles React away.
			</p>
			<p>
				<Counter step={1} />
				<Counter step={2} />
				<Counter step={10} />
			</p>
			<p>
				<AdvancedCounter />
			</p>
			<p>
				<DynamicProps onClick={e => alert(e.target.innerText)}>
					It works {Math.random() < 0.5 ? "great" : "nice"}!
				</DynamicProps>
			</p>
			<p>
				<ToggleSection />
			</p>
			<p>
				<Recursive />
			</p>
		</div>
	);
};
