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
						},
						loose: true,
						spec: false,
					},
				],
			]
		},
		{
			include: ["./test", "./lib/runtime"],
			presets: [
					["@babel/preset-env", {
						modules: 'cjs',
					}],
					"@babel/preset-react"
			],
			plugins: ["./"]
		}
	]
};
