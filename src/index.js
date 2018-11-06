import { declare } from "@babel/helper-plugin-utils";
import { types as t } from "@babel/core";
import transformCreateElement from "./transformCreateElement";
import cleverReplace from "./cleverReplace";

export default declare(api => {
	api.assertVersion(7);

	return {
		pre(state) {
			this.reactNamespace = new Set();
			this.directImported = new Map();
			this.globals = [];
			this.imports = [];

			this.getType = node => {
				if (t.isIdentifier(node) && this.directImported.has(node.name)) {
					return this.directImported.get(node.name);
				} else if (
					t.isMemberExpression(node) &&
					t.isIdentifier(node.object) &&
					this.reactNamespace.has(node.object.name) &&
					t.isIdentifier(node.property)
				) {
					return node.property.name;
				}
			};

			const globalKeys = new Set();
			this.addGlobal = (node, key) => {
				if (key) {
					if (globalKeys.has(key)) return;
					globalKeys.add(key);
				}
				this.globals.push(node);
			};

			const importedHelpers = new Set();
			this.importHelper = exportName => {
				const name = `_rawact_${exportName}`;
				if (!importedHelpers.has(exportName)) {
					this.imports.push(
						t.importDeclaration(
							[t.importDefaultSpecifier(t.identifier(name))],
							t.stringLiteral(`babel-plugin-rawact/lib/runtime/${exportName}`)
						)
					);
					importedHelpers.add(exportName);
				}
				return t.identifier(name);
			};

			let uniqueNumber = 0;
			this.getUniqueNumber = () => {
				return uniqueNumber++;
			};

			this.getUniqueIdentifier = name => {
				return state.path.scope.generateUidIdentifier(name);
			};
		},
		visitor: {
			ImportDeclaration(path) {
				if (!t.isStringLiteral(path.node.source)) return;
				const source = path.node.source.value;
				if (source !== "react" && source !== "react-dom") return;
				const newSpecifiers = [];
				for (const specifier of path.node.specifiers) {
					if (
						t.isImportDefaultSpecifier(specifier) ||
						t.isImportNamespaceSpecifier(specifier)
					) {
						this.reactNamespace.add(specifier.local.name);
						path.insertBefore(
							t.importDeclaration(
								[t.importNamespaceSpecifier(specifier.local)],
								t.stringLiteral("babel-plugin-rawact/lib/runtime/react")
							)
						);
					}
					if (t.isImportSpecifier(specifier)) {
						this.directImported.set(
							specifier.local.name,
							specifier.imported.name
						);
						newSpecifiers.push(
							t.importSpecifier(specifier.local, specifier.imported)
						);
					}
				}
				if (newSpecifiers.length > 0) {
					path.replaceWith(
						t.importDeclaration(
							newSpecifiers,
							t.stringLiteral("babel-plugin-rawact/lib/runtime/react")
						)
					);
				} else {
					path.remove();
				}
			},
			Program: {
				exit(path) {
					path.traverse(
						{
							CallExpression(path) {
								const callee = path.node.callee;
								const type = this.getType(callee);
								switch (type) {
									case "createElement": {
										cleverReplace(
											path,
											transformCreateElement(path.node, {
												getType: this.getType.bind(this),
												addGlobal: this.addGlobal.bind(this),
												getUniqueIdentifier: this.getUniqueIdentifier.bind(
													this
												),
												getUniqueNumber: this.getUniqueNumber.bind(this),
												importHelper: this.importHelper.bind(this)
											})
										);
										break;
									}
								}
							}
						},
						this
					);
				}
			}
		},
		post(state) {
			for (const global of this.globals.reverse())
				state.path.unshiftContainer("body", global);
			for (const imp of this.imports.reverse())
				state.path.unshiftContainer("body", imp);
		}
	};
});
