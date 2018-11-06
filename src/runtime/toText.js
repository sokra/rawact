export default value => {
	if (value === false || value === null || value === undefined) return "";
	return `${value}`;
};
