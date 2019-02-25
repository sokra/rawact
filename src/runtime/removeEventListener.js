export default (root, node, event, old) => {
	if (event === 'mouseenter' || event === 'mouseleave') {
		node.removeEventListener(event, old);
		return;
	}
	root[`event_${event}`].delete(node);
};
