module.exports = {
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
					},
				],
				"@babel/preset-env"
			]
		},
		{
			include: ["./test", "./lib"],
			presets: [
					["@babel/preset-env", {
						modules: 'cjs',
					}],
					"@babel/preset-react"
			],
			plugins: [require("./")]
		}
	]
};
