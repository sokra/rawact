module.exports = {
	presets: ["@babel/preset-env"],
	overrides: [
		{
			include: "./src/runtime",
			presets: [["@babel/preset-env", { modules: false }]]
		}
	]
};
