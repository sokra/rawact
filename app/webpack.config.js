const path = require("path");
module.exports = {
	module: {
		rules: [
			{
				test: /\.js$/,
				include: path.resolve(__dirname, "src"),
				loader: "babel-loader"
			}
		]
	},
	resolve: {
		alias: {
			"babel-plugin-rawact": path.resolve(__dirname, "..")
		}
	}
};
