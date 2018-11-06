import useMemo from "./useMemo";
import expandObject from "../expandObject";

export default fn => {
	return props => {
		return useMemo(() => fn(props), expandObject(props));
	};
};
