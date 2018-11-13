export default (root, node, event, old) => {
	root[`event_${event}`].delete(node);
};
