import { types as t } from "@babel/core";

export default node => {
	if (t.isLiteral(node)) return true;
	return false;
};
