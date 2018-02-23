import Player from './Player'
class GameState {
  constructor() {
    this.players = {}
  }
  /*
  {
    one: {
      id: 'one',
      x: 5,
      y: 5
    },
    two: {
      id: 'two',
      x: 10,
      y: 10
    }
  };
  */
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
    this.players[id] = new Player({
      id: id,
      connected: true,
      x: Math.floor(Math.random() * 10) + 1,
      y: Math.floor(Math.random() * 10) + 1
    })
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

}
export default GameState
