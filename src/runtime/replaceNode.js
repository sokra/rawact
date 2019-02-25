export const toArray = x => {
	const array = [];
	toArrayInternal(x, array);
	return array;
};

const toArrayInternal = (x, array) => {
	if (NodeList.prototype.isPrototypeOf(x) || Array.isArray(x)) {
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
	const parentNode = (oldNodes[0] && oldNodes[0].parentNode) || (newNodes[0] && newNodes[0].parentNode);
	if (!parentNode) {
		return
	}
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
			if (node === undefined) {
				continue
			}
			oldSet.delete(node);
			if (nextOne) {
				try {
					parentNode.insertBefore(newNodes[i], nextOne);
				} catch (e) {
					debugger
				}
			} else {
				parentNode.appendChild(newNodes[i]);
			}
		}
		for (const old of oldSet) {
			try {
        parentNode.removeChild(old);
      } catch (e) {
        console.error(e)
      }
		}
	}
};
