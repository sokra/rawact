import { getComponent } from "../hooks";
import useContext from "./useContext";

export default defaultValue => {
	const symbol = Symbol();
	const Provider = ({ value, children }) => {
		const comp = getComponent();
		comp[symbol] = value;
		return children;
	};
	const Consumer = ({ children }) => {
		const value = useContext(context);
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
