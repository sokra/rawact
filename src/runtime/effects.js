let effects = [];

export function addEffect(fn) {
	effects.push(fn);
}

export function runEffects() {
	for (const effect of effects) {
		effect();
	}
	effects.length = 0;
}
