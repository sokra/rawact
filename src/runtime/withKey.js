import { KeySymbol } from "./renderArray";

export default (key, instructions) => {
	instructions[KeySymbol] = key;
	return instructions;
};
