import Player from './objects/Player'
import Mob from './objects/Mob'
class MainScene {
  constructor() {
    this.players = {}
    this.mobs = {
      mob1: new Mob({id: 'mob1', scene: this, tile: {x: 110, y: 110}}),
      mob2: new Mob({id: 'mob2', scene: this, tile: {x: 105, y: 105}})
    }
  }

  getPlayer(id) {
    return this.players[id]
  }

  generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  newPlayer(id) {
    var id = id ? id : this.generateId()
    this.players[id] = new Player({scene:this, id, tile: {x: Math.floor(Math.random() * 10) + 100, y:Math.floor(Math.random() * 10) + 110}})
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
export default MainScene
