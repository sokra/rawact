const svgElmentsArray = ["circle", "defs", "ellipse", "g", "line",
	"linearGradient",
	"path", "polygon", "polyline", "radialGradient", "rect", "stop", "svg",
	"symbol", "text", "use"
]
export const svgElements = svgElmentsArray.reduce((map, item) => {
	map[item] = true;
	return map;
}, {});
