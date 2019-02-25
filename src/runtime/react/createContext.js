import { getComponent } from "../hooks";
import useContext from "./useContext";

export default defaultValue => {
	const symbol = Symbol();
	let comp0;
	const Provider = ({ value, children }) => {
		const comp = getComponent();
		comp0 = comp
		comp[symbol] = value;
		return children;
	};
	const Consumer = ({ children }) => {
		const value = useContext(context) || comp0[symbol];
		return children(value);
	};
	const context = {
		symbol,
		defaultValue,
		Provider,
		Consumer
	};
	return context;
};
