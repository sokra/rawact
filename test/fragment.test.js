import React from "react";
import ReactDOM from "react-dom";
import renderHelper from "./renderHelper";

const Hello = ({ name }) => <React.Fragment>Hello {name}!</React.Fragment>;
const GoodBye = ({ name }) => (
	<React.Fragment>
		Good<b>B</b>ye {name}!
	</React.Fragment>
);

const ChangingChildren = ({ type, name }) => {
	const children = [
		type === "hello" ? <Hello name={name} /> : <GoodBye name={name} />
	];
	if (type === "goodbye") {
		children.push("(and sorry)");
	}
	return <React.Fragment>{children}</React.Fragment>;
};

const ChangingChildrenElement = ({ isDiv }) => {
	return (
		<React.Fragment>
			Testing...
			{isDiv ? <div /> : <span />}
		</React.Fragment>
	);
};

describe("fragments", () => {
	describe("rendering at the top", () => {
		it("renders correctly", () => {
			const { element } = renderHelper(<Hello name="world" />);

			expect(element).toMatchSnapshot();
		});

		it("updates correctly", () => {
			const { element } = renderHelper(<Hello name="world" />);

			ReactDOM.render(<Hello name="me" />, element);

			expect(element).toMatchSnapshot();
		});

		it("updates correctly, changing a child", () => {
			const { element } = renderHelper(
				<ChangingChildrenElement isDiv={false} />
			);

			ReactDOM.render(<ChangingChildrenElement isDiv />, element);

			expect(element).toMatchSnapshot();
		});

		// TODO - null reference exception in replaceNode
		xit("adds new children", () => {
			const { element } = renderHelper(
				<ChangingChildren name="world" type="hello" />
			);

			ReactDOM.render(<ChangingChildren name="me" type="goodbye" />, element);

			expect(element).toMatchSnapshot();
		});

		// TODO - null reference exception in replaceNode
		xit("removes children", () => {
			const { element } = renderHelper(
				<ChangingChildren name="world" type="goodbye" />
			);

			ReactDOM.render(<ChangingChildren name="me" type="hello" />, element);

			expect(element).toMatchSnapshot();
		});

		it("removes non react children", () => {
			const element = document.createElement("div");
			element.innerHTML = "This<span>Rogue</span>Test";
			ReactDOM.render(<Hello name="world" />, element);

			expect(element).toMatchSnapshot();
		});
	});

	describe("rendering under an element", () => {
		it("renders correctly", () => {
			const { element } = renderHelper(
				<div>
					<Hello name="world" />
				</div>
			);

			expect(element).toMatchSnapshot();
		});

		it("updates correctly", () => {
			const { element } = renderHelper(
				<div>
					<Hello name="world" />
				</div>
			);

			ReactDOM.render(
				<div>
					<Hello name="me" />
				</div>,
				element
			);

			expect(element).toMatchSnapshot();
		});

		it("updates correctly, changing a child", () => {
			const { element } = renderHelper(
				<div>
					<ChangingChildrenElement isDiv={false} />
				</div>
			);

			ReactDOM.render(
				<div>
					<ChangingChildrenElement isDiv />
				</div>,
				element
			);

			expect(element).toMatchSnapshot();
		});

		it("adds new children", () => {
			const { element } = renderHelper(
				<div>
					<ChangingChildren name="world" type="hello" />
				</div>
			);

			ReactDOM.render(
				<div>
					<ChangingChildren name="me" type="goodbye" />
				</div>,
				element
			);

			expect(element).toMatchSnapshot();
		});

		it("removes children", () => {
			const { element } = renderHelper(
				<div>
					<ChangingChildren name="world" type="goodbye" />
				</div>
			);

			ReactDOM.render(
				<div>
					<ChangingChildren name="me" type="hello" />
				</div>,
				element
			);

			expect(element).toMatchSnapshot();
		});

		it("moves up", () => {
			const { element } = renderHelper(
				<div>
					<Hello name="world" />
				</div>
			);

			ReactDOM.render(<Hello name="world" />, element);

			expect(element).toMatchSnapshot();
		});

		it("moves down", () => {
			const { element } = renderHelper(<Hello name="world" />);

			ReactDOM.render(
				<div>
					<Hello name="world" />
				</div>,
				element
			);

			expect(element).toMatchSnapshot();
		});
	});
});
