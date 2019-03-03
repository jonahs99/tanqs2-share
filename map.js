// This code is the map model
// It watches the database for changes to the maps nodes
// and updates them accordingly

const EventEmitter = require('eventemitter3')

const Diff = require('./diff')

class MapLoader extends EventEmitter {
	constructor(db, map_name) {
		super()

		this._sync(db, map_name)
	}

	// public
	
	get_entity_opts(name) {
		const node = this.nodes[name]
		if (!node) {
			console.error(`No node '${name}'`)
			return {}
		}
		return this._node_opts(node)
	}

	// private

	_sync(db, map_name) {
		console.log(`Syncing map '${map_name}'`)

		this.nodes = {}

		db.collection('maps').doc(map_name).collection('nodes')
		.onSnapshot(snapshot => {
			for (let change of snapshot.docChanges()) {
				const doc = change.doc
				const id = doc.id
				if (!this.nodes[id]) {
					this.nodes[id] = {}
				}
				const node = this.nodes[id]
				node.id = id
				node.data = doc.data()
				node.parents = node.data['extends'] || []
				node.entity = null
				node._needs_refresh = true
			}

			for (let node of Object.values(this.nodes)) {
				this._refresh_node(node)
			}
		})
	}

	_refresh_node(node) {
		let parents_refreshed = false
		for (let parent_id of node.parents) {
			const parent_node = this.nodes[parent_id]
			if (!parent_node) {
				console.error(`Bad node reference '${parent_id}' in node '${node.id}'.`)
				continue
			}
			parents_refreshed = parents_refreshed || this._refresh_node(parent_node)
		}
		if (node._needs_refresh || parents_refreshed) {
			this._update_node(node)	

			node._needs_refresh = false
			return true
		}
		return false
	}

	_update_node(node) {
		this.emit('node-change', node)
	}

	_node_opts(node) {
		const opts = {}
		for (let parent_id of node.parents) {
			const parent_node = this.nodes[parent_id]
			if (!parent_node) {
				console.error(`Bad node reference '${parent_id}' in node '${node.id}'.`)
				continue
			}
			Diff.apply(opts, this._node_opts(parent_node))
		}
		Diff.apply(opts, node.data.opts)
		return opts
	}
}

module.exports = MapLoader
