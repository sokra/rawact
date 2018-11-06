import { types as t } from "@babel/core";
import isConstant from "./isConstant";

const isEqualConstant = (node, helpers) => {
	if (isConstant(node)) return true;
	if (t.isObjectExpression(node)) {
		for (const prop of node.properties) {
			if (prop.computed) {
				if (!isConstant(prop.key)) return false;
			}
			if (!isConstant(prop.value)) return false;
		}
		return true;
	}
	if (t.isCallExpression(node)) {
		const type = helpers.getType(node.callee);
		if (type === "createElement") {
			for (const arg of node.arguments) {
				if (!isEqualConstant(arg)) return false;
			}
			return true;
		}
	}
	return false;
};

export { isEqualConstant as default };
