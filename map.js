// This code is the map model
// It watches the database for changes to the maps nodes
// and updates them accordingly

const EventEmitter = require('eventemitter3')

const Diff = require('./diff')

class MapLoader extends EventEmitter {
	constructor(db) {
		super()

		this.db = db
	}

	sync(map_name) {
		this.db.collection('maps').doc(map_name).onSnapshot(
			doc => {
				const root_node = doc.data().root
				
				this.emit('update', this._resolve(root_node))
			})
	}

	_resolve(node) {
		switch(node.type) {
			case 'group':
				const child_entities = Object.values(node.children).map(child => this._resolve(child))
				return [].concat(...child_entities)

			case 'instance':
				return [ this._resolve_instance(node) ]
		}

		console.log('Node has unknown type:')
		console.log(node)
		return []
	}

	_resolve_instance(node) {
		return node.components
	}
}

module.exports = MapLoader
