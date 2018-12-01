const toArray = x => {
	const array = [];
	toArrayInternal(x, array);
	return array;
};

const toArrayInternal = (x, array) => {
	if (Array.isArray(x)) {
		for (const item of x) {
			toArrayInternal(item, array);
		}
	} else {
		array.push(x);
	}
};

export default (oldNodes, newNodes) => {
	if (oldNodes === newNodes) return;
	oldNodes = toArray(oldNodes);
	newNodes = toArray(newNodes);
	const parentNode = oldNodes[0].parentNode;
	const nextOne = oldNodes[oldNodes.length - 1].nextSibling;
	if (!nextOne && parentNode.firstChild === oldNodes[0]) {
		// replaced whole parent: take shortcut to clear nodes here
		parentNode.textContent = "";
		for (let i = 0; i < newNodes.length; i++) {
			parentNode.appendChild(newNodes[i]);
		}
	} else {
		const oldSet = new Set(oldNodes);
		for (let i = 0; i < newNodes.length; i++) {
			const node = newNodes[i];
			oldSet.delete(node);
			if (nextOne) {
				parentNode.insertBefore(newNodes[i], nextOne);
			} else {
				parentNode.appendChild(newNodes[i]);
			}
		}
		for (const old of oldSet) {
			parentNode.removeChild(old);
		}
	}
};
