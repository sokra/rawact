import { types as t } from "@babel/core";

const isIIFE = node => {
	return (
		t.isCallExpression(node) &&
		node.arguments.length === 0 &&
		t.isFunction(node.callee)
	);
};

export default (path, node) => {
	if (t.isReturnStatement(path.parentPath.node) && isIIFE(node)) {
		let body = node.callee.body;
		if (t.isExpression(body))
			body = t.expressionStatement(t.returnStatement(body));
		path.parentPath.replaceWithMultiple(body.body);
		return;
	}
	path.replaceWith(node);
};
