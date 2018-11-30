import React from "react";
import ReactDOM from "react-dom";
import * as Fragment from './cases/fragment';
import renderHelper from "./renderHelper";

describe('fragments', () => {
	describe('rendering at the top', () => {
		it('renders correctly', () => {
			const { element } = renderHelper(<Fragment.Hello name="world"/>);

			expect(element).toMatchSnapshot();
		});

		it('updates correctly', () => {
			const { element } = renderHelper(<Fragment.Hello name="world"/>);

			ReactDOM.render(<Fragment.Hello name="me"/>, element);

			expect(element).toMatchSnapshot();
		});

		it('updates correctly, changing a child', () => {
			const { element } = renderHelper(<Fragment.ChangingChildrenElement isDiv={false}/>);

			ReactDOM.render(<Fragment.ChangingChildrenElement isDiv/>, element);

			expect(element).toMatchSnapshot();
		});

		it('adds new children', () => {
			const { element } = renderHelper(<Fragment.ChangingChildren name="world" type="hello"/>);

			ReactDOM.render(<Fragment.ChangingChildren name="me" type="goodbye"/>, element);

			expect(element).toMatchSnapshot();
		});

		it('removes children', () => {
			const { element } = renderHelper(<Fragment.ChangingChildren name="world" type="goodbye"/>);

			ReactDOM.render(<Fragment.ChangingChildren name="me" type="hello"/>, element);

			expect(element).toMatchSnapshot();
		});

		it('removes non react children', () => {
			const element = document.createElement('div');
			element.innerHTML = 'This<span>Rogue</span>Test';
			ReactDOM.render(<Fragment.Hello name="world"/>, element);

			expect(element).toMatchSnapshot();
		});
	});

	describe('rendering under an element', () => {
		it('renders correctly', () => {
			const { element } = renderHelper(<div><Fragment.Hello name="world"/></div>);

			expect(element).toMatchSnapshot();
		});

		it('updates correctly', () => {
			const { element } = renderHelper(<div><Fragment.Hello name="world"/></div>);

			ReactDOM.render(<div><Fragment.Hello name="me"/></div>, element);

			expect(element).toMatchSnapshot();
		});

		it('updates correctly, changing a child', () => {
			const { element } = renderHelper(<div><Fragment.ChangingChildrenElement isDiv={false}/></div>);

			ReactDOM.render(<div><Fragment.ChangingChildrenElement isDiv/></div>, element);

			expect(element).toMatchSnapshot();
		});

		it('adds new children', () => {
			const { element } = renderHelper(<div><Fragment.ChangingChildren name="world" type="hello"/></div>);

			ReactDOM.render(<div><Fragment.ChangingChildren name="me" type="goodbye"/></div>, element);

			expect(element).toMatchSnapshot();
		});

		it('removes children', () => {
			const { element } = renderHelper(<div><Fragment.ChangingChildren name="world" type="goodbye"/></div>);

			ReactDOM.render(<div><Fragment.ChangingChildren name="me" type="hello"/></div>, element);

			expect(element).toMatchSnapshot();
		});

		it('moves up', () => {
			const { element } = renderHelper(<div><Fragment.Hello name="world"/></div>);

			ReactDOM.render(<Fragment.Hello name="world"/>, element);

			expect(element).toMatchSnapshot();
		});

		it('moves down', () => {
			const { element } = renderHelper(<Fragment.Hello name="world"/>);

			ReactDOM.render(<div><Fragment.Hello name="world"/></div>, element);

			expect(element).toMatchSnapshot();
		});
	});
});
