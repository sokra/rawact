import { KeySymbol } from "./renderArray";

export default (instructions, key) => {
	instructions[KeySymbol] = key;
};
