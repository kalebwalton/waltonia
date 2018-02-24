import Player from './objects/Player'
class MainScene {
  constructor() {
    this.players = {}
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
    this.players[id] = new Player({scene:this, id, tile: {x: Math.floor(Math.random() * 10) + 1, y:Math.floor(Math.random() * 10) + 1}})
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
      players: this.getEnteredPlayers()
    }
  }

}
export default MainScene
