const START_LOWERCASE_ALPHABET_CODE = "a".charCodeAt(0);
const START_UPPERCASE_ALPHABET_CODE = "A".charCodeAt(0);
const DELTA_A_TO_Z = "z".charCodeAt(0) - START_LOWERCASE_ALPHABET_CODE + 1;

export default function numberToIdentifier(n) {
	// lower case
	if (n < DELTA_A_TO_Z) {
		return String.fromCharCode(START_LOWERCASE_ALPHABET_CODE + n);
	}

	// upper case
	if (n < DELTA_A_TO_Z * 2) {
		return String.fromCharCode(
			START_UPPERCASE_ALPHABET_CODE + n - DELTA_A_TO_Z
		);
	}

	// use multiple letters
	return (
		numberToIdentifier(n % (2 * DELTA_A_TO_Z)) +
		numberToIdentifier(Math.floor(n / (2 * DELTA_A_TO_Z)))
	);
}
