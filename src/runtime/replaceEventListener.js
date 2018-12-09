import addEventListener from './addEventListener';

export default (root, node, event, old, handler) => {
	if (event === 'mouseenter' || event === 'mouseleave') {
		node.removeEventListener(event, old);
		node.addEventListener(event, handler);
		return;
	}
	const key = `event_${event}`;
	if (!root[key]) {
		addEventListener(root, node, event, handler);
		return;
	}
	root[key].set(node, handler);
};
