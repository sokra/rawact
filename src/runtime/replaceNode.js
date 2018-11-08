const toArray = x => {
	const array = [];
	toArrayInteral(x, array);
	return array;
};

const toArrayInteral = (x, array) => {
	if (Array.isArray(x)) {
		for (const item of x) {
			toArrayInteral(item, array);
		}
	} else {
		array.push(x);
	}
};

export default (oldNodes, newNodes) => {
	oldNodes = toArray(oldNodes);
	newNodes = toArray(newNodes);
	for (const old of oldNodes) {
		if (!old.isConnected) debugger;
	}
	const parentNode = oldNodes[0].parentNode;
	const nextOne = oldNodes[oldNodes.length - 1].nextSibling;
	const oldSet = new Set(oldNodes);
	let j = 0;
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
};
