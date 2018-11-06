export default (node, event, old, handler) => {
	node.removeEventListener(event, old);
	node.addEventListener(event, handler);
};
