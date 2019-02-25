import {
	svgElements
} from "../svgElements";


export default function (name) {
	return svgElements[name] ?
		document.createElementNS('http://www.w3.org/2000/svg', name) :
		document.createElement(name);
}
