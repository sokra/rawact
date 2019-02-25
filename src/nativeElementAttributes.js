import {
	types as t
} from "@babel/core";
import isConstant from "./isConstant";
import isEqualConstant from "./isEqualConstant";
import {
	svgElements
} from "./svgElements";

const checkChange = (scope, name, value, statement) => {
	const slot = scope.createSlot("old_" + name);
};

export default (
	scope,
	node,
	element,
	attribute,
	value,
	props,
	createStatements,
	updateStatements,
	unmountStatements
) => {
	let valueIsConst = isConstant(value);

	const captureAndCheckedUpdate = setter => {
		if (valueIsConst) {
			createStatements.push(setter(value));
		} else {
			const local = scope.createCapturedLocal(attribute, value);
			const old = scope.createSlot("old_" + attribute);
			const update = setter(t.assignmentExpression("=", old, local));
			createStatements.push(update);
			updateStatements.push(
				t.ifStatement(t.binaryExpression("!==", old, local), update)
			);
		}
	};

	const captureAndAttributeCheckedUpdate = (setter, unsetter) => {
		if (valueIsConst) {
			createStatements.push(t.expressionStatement(setter(value)));
		} else {
			const local = scope.createCapturedLocal(attribute, value);
			const old = scope.createSlot("old_" + attribute);
			const update = setter(t.assignmentExpression("=", old, local));
			createStatements.push(t.ifStatement(t.binaryExpression("!==", local, t.identifier(
				"undefined")), update));
			updateStatements.push(
				t.ifStatement(t.binaryExpression("!==", old, local),
					t.blockStatement([
						t.ExpressionStatement(
							t.conditionalExpression(
								t.binaryExpression("!==", local, t.identifier("undefined")),
								update,
								unsetter(),
							)
						),
						t.assignmentExpression("=", old, local),
					])
				)
			);
		}
	};

	const captureAndPropertyCheckedUpdate = (setter, getter) => {
		if (valueIsConst) {
			createStatements.push(setter(value));
		} else {
			const local = scope.createCapturedLocal(attribute, value);
			const old = getter();
			const update = setter(t.assignmentExpression("=", old, local));
			createStatements.push(update);
			updateStatements.push(
				t.ifStatement(t.binaryExpression("!==", old, local), update)
			);
		}
	};

	const captureAndChecked3WayUpdate = (construct, replace, remove) => {
		if (valueIsConst) {
			const old = scope.createSlot("old_" + attribute);
			createStatements.push(
				construct(value, value => t.assignmentExpression("=", old, value))
			);
			unmountStatements.push(remove(old));
		} else {
			const local = scope.createCapturedLocal(attribute, value);
			const old = scope.createSlot("old_" + attribute);
			createStatements.push(
				construct(local, value => t.assignmentExpression("=", old, value))
			);
			updateStatements.push(
				t.ifStatement(
					t.binaryExpression("!==", old, local),
					t.blockStatement([
						replace(old, local, value =>
							t.assignmentExpression("=", old, value)
						)
					])
				)
			);
			unmountStatements.push(remove(old));
		}
	};

	const captureAndListenEvent = (event, createListener) => {
		captureAndChecked3WayUpdate(
			(local, store) =>
			t.expressionStatement(
				t.callExpression(scope.importHelper("addEventListener"), [
					scope.root(),
					node,
					t.stringLiteral(event),
					store(createListener(local))
				])
			),
			(old, local, store) =>
			t.expressionStatement(
				t.callExpression(scope.importHelper("replaceEventListener"), [
					scope.root(),
					node,
					t.stringLiteral(event),
					old,
					store(createListener(local))
				])
			),
			old =>
			t.expressionStatement(
				t.callExpression(scope.importHelper("removeEventListener"), [
					scope.root(),
					node,
					t.stringLiteral(event),
					old
				])
			)
		);
	};

	if (attribute === "ref") {
		const local = scope.createCapturedLocal(attribute, value);
		createStatements.push(
			t.ifStatement(local, t.expressionStatement(t.callExpression(local, [node])))
		);
		return;
	}

	if (/^on[A-Z]/.test(attribute)) {
		let event = attribute.slice(2).toLowerCase();

		if (event === "doubleclick") event = "dblclick";

		if (element === "input" && event === "change") {
			const param = scope.helpers.getUniqueIdentifier("inputEvent");
			captureAndListenEvent("input", local =>
				t.arrowFunctionExpression(
					[param],
					t.logicalExpression(
						"&&",
						t.logicalExpression(
							"||",
							t.binaryExpression(
								"===",
								t.memberExpression(node, t.identifier("type")),
								t.stringLiteral("text")
							),
							t.binaryExpression(
								"===",
								t.memberExpression(node, t.identifier("type")),
								t.stringLiteral("number")
							)
						),
						t.callExpression(local, [param])
					)
				)
			);
		}

		captureAndListenEvent(event, local => local);
		return;
	}

	if (attribute !== 'style' && svgElements[element]) {
		valueIsConst = valueIsConst || isEqualConstant(value, scope.helpers);
		if (attribute === "className") {
			attribute = "class"
		}
		captureAndAttributeCheckedUpdate(
			local =>
			t.callExpression(t.memberExpression(node, t.identifier(
				"setAttribute")), [
				t.stringLiteral(attribute.replace(/[A-Z]/g, A => '-' + A.toLowerCase())),
				local
			]),
			() =>
			t.callExpression(t.memberExpression(node, t.identifier(
				"removeAttribute")), [
				t.stringLiteral(attribute.replace(/[A-Z]/g, A => '-' + A.toLowerCase()))
			])
		);
		return;
	}

	switch (attribute) {
		case "style":
			{
				valueIsConst = valueIsConst || isEqualConstant(value, scope.helpers);
				const setStyle = scope.importHelper("setStyle");
				captureAndCheckedUpdate(local =>
					t.expressionStatement(t.callExpression(setStyle, [node, local]))
				);
				return;
			}
		case "value":
			{
				captureAndPropertyCheckedUpdate(
					local =>
					t.expressionStatement(
						t.assignmentExpression(
							"=",
							t.memberExpression(node, t.identifier(attribute)),
							local
						)
					),
					() => t.memberExpression(node, t.identifier(attribute))
				);
				return;
			}
		case "autoFocus":
			attribute = "autofocus";
			break;
	}

	// Fallback: Set property of node
	captureAndCheckedUpdate(local =>
		t.expressionStatement(
			t.assignmentExpression(
				"=",
				t.memberExpression(node, t.identifier(attribute)),
				local
			)
		)
	);
};
