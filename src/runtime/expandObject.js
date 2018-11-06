export default obj =>
	Object.keys(obj).reduce((deps, key) => {
		deps.push(key, obj[key]);
		return deps;
	}, []);
