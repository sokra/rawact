const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");

const testCasesPath = path.resolve(__dirname, "cases");

describe("integration", () => {
	const testCases = fs
		.readdirSync(testCasesPath)
		.filter(file => file.endsWith(".js"));
	for (const filename of testCases) {
		const name = path.basename(filename, path.extname(filename));
		it(`should compile ${name}`, () => {
			const casePath = path.resolve(testCasesPath, filename);
			const input = fs.readFileSync(casePath);
			const { code } = babel.transformFileSync(casePath, {
				caller: {
					name: "test-cases",
					supportsStaticESM: false
				},
				filename: casePath,
				babelrc: false,
				presets: ["@babel/preset-react"],
				plugins: [babel.createConfigItem(require("../"))]
			});
			expect(code).toMatchSnapshot();
		});
	}
});
