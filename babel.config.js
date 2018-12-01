module.exports = {
	"env": {
		"test-rawact": {
			include: ["./test", "./lib/runtime"],
			presets: [
				["@babel/preset-env", {
					modules: 'cjs',
				}],
				"@babel/preset-react"
			],
			plugins: ["./"]
		},
		"test-react": {
			include: ["./test", "./lib/runtime"],
			presets: [
				["@babel/preset-env", {
					modules: 'cjs',
				}],
				"@babel/preset-react"
			],
		},
	},
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
					},
				],
			]
		}
	]
};
