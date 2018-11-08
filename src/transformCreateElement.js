import { types as t } from "@babel/core";
import numberToIdentifer from "./numberToIdentifer";
import nativeElementAttributes from "./nativeElementAttributes";
import attributesByElement from "./attributesByElement";

const parse = ([typeNode, propNode, ...children], helpers) => {
	const props = new Map();
	let dynamicProps = undefined;
	if (t.isObjectExpression(propNode)) {
		for (const prop of propNode.properties) {
			if (t.isIdentifier(prop.key)) {
				props.set(prop.key.name, prop.value);
			}
		}
	} else if (!t.isNullLiteral(propNode)) {
		dynamicProps = propNode;
	}
	const isFragment = helpers.getType(typeNode) === "Fragment";
	return {
		kind: isFragment
			? "Fragment"
			: t.isStringLiteral(typeNode)
				? "html"
				: "Component",
		typeNode,
		props,
		dynamicProps,
		children
	};
};

class ContextScope {
	constructor(helpers) {
		this.contextName = helpers.getUniqueIdentifier("context");
		this._slotIndex = 0;
		this._captured = [];
		this.helpers = helpers;
	}

	context() {
		return this.contextName;
	}

	type() {
		return t.memberExpression(this.contextName, t.identifier("_"));
	}

	unmount() {
		return t.memberExpression(this.contextName, t.identifier("$"));
	}

	_slotIndexToName(i, name) {
		return this.helpers.debug
			? `${numberToIdentifer(i)}_${name}`
			: numberToIdentifer(i);
	}

	createSlot(name) {
		const i = this._slotIndex++;
		return t.memberExpression(
			this.contextName,
			t.identifier(this._slotIndexToName(i, name))
		);
	}

	createSlotName(name) {
		const i = this._slotIndex++;
		return t.stringLiteral(this._slotIndexToName(i, name));
	}

	createCapturedLocal(name, capturedExpression) {
		const ident = this.helpers.getUniqueIdentifier(name);
		this._captured.push(
			t.variableDeclaration("const", [
				t.variableDeclarator(ident, capturedExpression)
			])
		);
		return ident;
	}

	getCaptured() {
		return this._captured;
	}

	importHelper(exportName) {
		return this.helpers.importHelper(exportName);
	}

	createGlobalToken(name) {
		const ident = this.helpers.getUniqueIdentifier(name);
		this.helpers.addGlobal(
			t.variableDeclaration("const", [
				t.variableDeclarator(ident, t.objectExpression([]))
			])
		);
		return ident;
	}
}

const createNativeElement = (element, scope) => {
	const node = scope.createSlot("node");
	const createStatements = [];
	const updateStatements = [];
	const unmountStatements = [];

	let children = element.children;

	if (element.kind === "Fragment") {
		// do not create a node, a fragment will be created in the children handler
	} else if (element.kind === "html") {
		const createElement = scope.importHelper("createElement");
		createStatements.push(
			t.expressionStatement(
				t.assignmentExpression(
					"=",
					node,
					t.callExpression(createElement, [element.typeNode])
				)
			)
		);

		const elementName = element.typeNode.value;
		let props = element.props;

		if (element.dynamicProps) {
			const propsLocal = scope.createCapturedLocal(
				"props",
				element.dynamicProps
			);
			props = new Map();
			const attributes = attributesByElement[element.typeNode.value];
			for (const key of attributes) {
				if (key === "children") {
					if (children.length === 0) {
						children = [t.memberExpression(propsLocal, t.identifier(key))];
					}
				} else {
					props.set(key, t.memberExpression(propsLocal, t.identifier(key)));
				}
			}
		}

		for (const [key, value] of props) {
			nativeElementAttributes(
				scope,
				node,
				elementName,
				key,
				value,
				element.props,
				createStatements,
				updateStatements,
				unmountStatements
			);
		}
	} else {
		console.log(element);
		throw new Error(`Unsupported element kind ${element.kind}`);
	}

	if (children.length > 0 || element.kind === "Fragment") {
		const childrenCreate = [];
		for (const child of children) {
			if (t.isStringLiteral(child)) {
				childrenCreate.push(child);

				continue;
			}
			if (
				t.isCallExpression(child) &&
				scope.helpers.getType(child.callee) === "createElement"
			) {
				// Inline element
				const parsedChild = parse(child.arguments, scope.helpers);
				if (parsedChild.kind !== "Component") {
					// inline native element
					const childElement = createNativeElement(parsedChild, scope);
					for (const statement of childElement.create) {
						createStatements.push(statement);
					}
					for (const statement of childElement.update) {
						updateStatements.push(statement);
					}
					for (const statement of childElement.unmount) {
						unmountStatements.push(statement);
					}
					childrenCreate.push(childElement.node);
					continue;
				}
			}
			const childLocal = scope.createCapturedLocal("child", child);
			const childNode = scope.createSlotName(`child_node`);
			createStatements.push(
				t.expressionStatement(
					t.callExpression(scope.importHelper("renderInternal"), [
						scope.context(),
						childLocal,
						childNode,
						t.numericLiteral(1)
					])
				)
			);
			updateStatements.push(
				t.expressionStatement(
					t.callExpression(scope.importHelper("renderInternal"), [
						scope.context(),
						childLocal,
						childNode,
						t.numericLiteral(0)
					])
				)
			);
			if (element.kind === "Fragment") {
				updateStatements.push(
					t.expressionStatement(
						t.assignmentExpression(
							"=",
							t.memberExpression(
								node,
								t.numericLiteral(childrenCreate.length),
								true
							),
							t.memberExpression(scope.context(), childNode, true)
						)
					)
				);
			}
			unmountStatements.push(
				t.expressionStatement(
					t.callExpression(scope.importHelper("unmountInternal"), [
						t.memberExpression(
							scope.context(),
							t.identifier(childNode.value + "_")
						)
					])
				)
			);
			childrenCreate.push(t.memberExpression(scope.context(), childNode, true));
		}

		if (element.kind === "Fragment") {
			createStatements.push(
				t.expressionStatement(
					t.assignmentExpression(
						"=",
						node,
						t.callExpression(scope.importHelper("createFragment"), [
							t.arrayExpression(childrenCreate)
						])
					)
				)
			);
		} else {
			createStatements.push(
				t.expressionStatement(
					t.callExpression(scope.importHelper("renderChildren"), [
						node,
						t.arrayExpression(childrenCreate)
					])
				)
			);
		}
	}

	return {
		create: createStatements,
		update: updateStatements,
		unmount: unmountStatements,
		node
	};
};

const createComponentInstructions = (element, helpers) => {
	const props = [];
	for (const [key, value] of element.props) {
		props.push(t.objectProperty(t.identifier(key), value));
	}
	if (element.children.length > 1) {
		const fragmentElement = {
			kind: "Fragment",
			children: element.children
		};
		props.push(
			t.objectProperty(
				t.identifier("children"),
				createNativeInstructions(fragmentElement, helpers)
			)
		);
	} else if (element.children.length === 1) {
		props.push(t.objectProperty(t.identifier("children"), element.children[0]));
	}
	const renderCall = t.callExpression(helpers.importHelper("hooks"), [
		element.typeNode,
		t.objectExpression(props)
	]);
	return renderCall;
};

const ensureCapture = (expr, scope) => {
	const caputured = scope.getCaptured();
	if (caputured.length === 0) return expr;
	return t.callExpression(
		t.arrowFunctionExpression(
			[],
			t.blockStatement(caputured.concat(t.returnStatement(expr)))
		),
		[]
	);
};

const createNativeInstructions = (parsedElement, helpers) => {
	const scope = new ContextScope(helpers);
	const element = createNativeElement(parsedElement, scope);
	const token = scope.createGlobalToken("instructions");
	const test = t.binaryExpression("!==", scope.type(), token);
	const instructions = t.arrowFunctionExpression(
		[scope.context()],
		t.blockStatement([
			t.ifStatement(
				test,
				t.blockStatement(
					[
						t.ifStatement(
							scope.unmount(),
							t.expressionStatement(t.callExpression(scope.unmount(), []))
						),
						t.expressionStatement(
							t.assignmentExpression(
								"=",
								scope.unmount(),
								element.unmount.length > 0
									? t.arrowFunctionExpression(
											[],
											t.blockStatement(element.unmount)
									  )
									: t.nullLiteral()
							)
						),
						t.expressionStatement(
							t.assignmentExpression("=", scope.type(), token)
						)
					].concat(element.create)
				),
				t.blockStatement(element.update)
			),
			t.returnStatement(element.node)
		])
	);
	return ensureCapture(instructions, scope);
};

export default (node, helpers) => {
	const parsedElement = parse(node.arguments, helpers);
	if (parsedElement.kind === "Component") {
		return createComponentInstructions(parsedElement, helpers);
	} else {
		return createNativeInstructions(parsedElement, helpers);
	}
};
