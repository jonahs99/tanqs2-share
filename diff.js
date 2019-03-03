
function apply(state, diff) {
	for (let [key, value] of Object.entries(diff)) {
		const pre = key.charAt(0)
		const rest = key.substring(1)

		if (pre == '+') {
			state[rest] = value
			continue
		}

		if (pre == '-') {
			delete state[rest]
			continue
		}

		if (typeof value !== 'object' || value === null) {
			state[key] = value
			continue
		}

		if (Array.isArray(value)) {
			state[key] = value.slice()
			continue
		}

		// Recurse
		if (!state.hasOwnProperty(key)) {
			state[key] = {}
		}
		apply(state[key], value)
	}
}

module.exports = { apply }
