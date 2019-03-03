module.exports = function require1(...modules) {
	let err

	for (let mod of modules) {
		try {
			return require(mod)
		} catch (e) {
			err = e
			continue
		}
	}

	throw(err)
}
