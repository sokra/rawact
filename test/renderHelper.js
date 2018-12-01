import ReactDOM from "react-dom";

export default toRender => {
	const element = document.createElement("div");
	const rendered = ReactDOM.render(toRender, element);

	return { element, rendered };
};
