import Player from './objects/Player'
import Mob from './objects/Mob'
class MapScene {
  constructor() {
    this.players = {}
  }

  getPlayer(id) {
    return this.players[id]
  }

  // generateId() {
  //   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
  //     var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
  //     return v.toString(16);
  //   });
  // }

  newPlayer(id) {
    var id = id ? id : this.generateId()
    this.players[id] = new Player({scene:this, id, tile: {x: Math.floor(Math.random() * 10) + 5, y:Math.floor(Math.random() * 10) + 10}})
    return this.players[id]
  }

  getEnteredPlayers() {
    var ret = {}
    for (var id in this.players) {
      if (this.players[id].entered) {
        ret[id] = this.players[id]
      }
    }
    return ret
  }

  getTickState() {
    return {
      players: this.getEnteredPlayers(),
      mobs: this.mobs
    }
  }

}
export default MapScene
