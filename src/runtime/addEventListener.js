export default (root, node, event, handler) => {
	if (event === 'mouseenter' || event === 'mouseleave') {
		node.addEventListener(event, handler);
		return;
	}
	const key = `event_${event}`;
	if (!root[key]) {
		const map = (root[key] = new Map());
		const node = root.node;
		node.addEventListener(event, e => {
			let target = e.target;
			let listener;
			do {
				listener = map.get(target);
			} while (!listener && target !== node && (target = target.parentNode));
			return listener && listener(e);
		});
	}
	root[key].set(node, handler);
};
