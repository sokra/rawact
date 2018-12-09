export default x => x.contains ? x : {
	contains: () => {}
};
