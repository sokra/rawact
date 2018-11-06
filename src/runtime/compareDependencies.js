export default (dependencies, oldDependencies) => {
	if (
		oldDependencies &&
		dependencies &&
		oldDependencies.length === dependencies.length
	) {
		let i;
		for (i = 0; i < dependencies.length; i++) {
			if (oldDependencies[i] !== dependencies[i]) return false;
		}
		return true;
	}
	return false;
};
