module.exports = {
	presets: [["@babel/preset-env", { targets: "maintained node versions" }]],
	overrides: [
		{
			include: "./src/runtime",
			presets: [
				[
					"@babel/preset-env",
					{
						modules: false,
						targets: {
							esmodules: true
						}
					}
				]
			]
		}
	]
};
