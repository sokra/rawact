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
		type === "hello" ? (
			<Hello name={name} key="hello" />
		) : (
			<GoodBye name={name} key="bye" />
		)
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
		it("renders correctly", async () => {
			const element = await renderHelper(<Hello name="world" />);

			expect(element).toMatchSnapshot();
		});

		it("updates correctly", async () => {
			const element = await renderHelper(<Hello name="world" />);

			renderHelper(<Hello name="me" />, element);

			expect(element).toMatchSnapshot();
		});

		it("updates correctly, changing a child", async () => {
			const element = await renderHelper(
				<ChangingChildrenElement isDiv={false} />
			);

			renderHelper(<ChangingChildrenElement isDiv />, element);

			expect(element).toMatchSnapshot();
		});

		// TODO - null reference exception in replaceNode
		xit("adds new children", async () => {
			const element = await renderHelper(
				<ChangingChildren name="world" type="hello" />
			);

			renderHelper(<ChangingChildren name="me" type="goodbye" />, element);

			expect(element).toMatchSnapshot();
		});

		// TODO - null reference exception in replaceNode
		xit("removes children", async () => {
			const element = await renderHelper(
				<ChangingChildren name="world" type="goodbye" />
			);

			renderHelper(<ChangingChildren name="me" type="hello" />, element);

			expect(element).toMatchSnapshot();
		});

		it("removes non react children", async () => {
			const element = document.createElement("div");
			element.innerHTML = "This<span>Rogue</span>Test";
			renderHelper(<Hello name="world" />, element);

			expect(element).toMatchSnapshot();
		});
	});

	describe("rendering under an element", () => {
		it("renders correctly", async () => {
			const element = await renderHelper(
				<div>
					<Hello name="world" />
				</div>
			);

			expect(element).toMatchSnapshot();
		});

		it("updates correctly", async () => {
			const element = await renderHelper(
				<div>
					<Hello name="world" />
				</div>
			);

			renderHelper(
				<div>
					<Hello name="me" />
				</div>,
				element
			);

			expect(element).toMatchSnapshot();
		});

		it("updates correctly, changing a child", async () => {
			const element = await renderHelper(
				<div>
					<ChangingChildrenElement isDiv={false} />
				</div>
			);

			renderHelper(
				<div>
					<ChangingChildrenElement isDiv />
				</div>,
				element
			);

			expect(element).toMatchSnapshot();
		});

		it("adds new children", async () => {
			const element = await renderHelper(
				<div>
					<ChangingChildren name="world" type="hello" />
				</div>
			);

			renderHelper(
				<div>
					<ChangingChildren name="me" type="goodbye" />
				</div>,
				element
			);

			expect(element).toMatchSnapshot();
		});

		it("removes children", async () => {
			const element = await renderHelper(
				<div>
					<ChangingChildren name="world" type="goodbye" />
				</div>
			);

			renderHelper(
				<div>
					<ChangingChildren name="me" type="hello" />
				</div>,
				element
			);

			expect(element).toMatchSnapshot();
		});

		it("moves up", async () => {
			const element = await renderHelper(
				<div>
					<Hello name="world" />
				</div>
			);

			renderHelper(<Hello name="world" />, element);

			expect(element).toMatchSnapshot();
		});

		it("moves down", async () => {
			const element = await renderHelper(<Hello name="world" />);

			renderHelper(
				<div>
					<Hello name="world" />
				</div>,
				element
			);

			expect(element).toMatchSnapshot();
		});
	});
});
