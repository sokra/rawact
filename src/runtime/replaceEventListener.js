export default (root, node, event, old, handler) => {
	root[`event_${event}`].set(node, handler);
};
