export default obj => {
	if (!obj || typeof obj !== "object") return [obj];
	const keys = Object.keys(obj);
	return [keys.length].concat(keys).concat(keys.map(key => obj[key]));
};
