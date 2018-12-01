import ReactDOM from "react-dom";

export default (toRender, element) => {
	return new Promise(resolve => {
		const element = element || document.createElement("div");
		ReactDOM.render(toRender, element, () => {
			resolve(element);
		});
	});
};
