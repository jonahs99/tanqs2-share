// Interface to the world database

class WorldData {
	constructor(db, world_name) {
		super()

		this.db = db
		this.world_name = world_name
	}

	get() {
		const doc_ref = this.db.collection('worlds').doc(this.world_name)

		return new Promise((resolve, reject) => {
			doc_ref.get().then(
				(doc) => { resolve(this.load(doc)) },
				(e) => reject(e)
			)
		})
	}

	// converts a world file to a world config
	load(file) {
		// TODO: including outside map files

		let world_cfg = {}

		// TEMPLATES
	
		world_cfg.templates = new Map()

		// ENTITIES

		world_cfg.entities = []

		return world_cfg
	}
}

