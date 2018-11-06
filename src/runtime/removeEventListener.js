export default (node, event, old) => {
	node.removeEventListener(event, old);
};
