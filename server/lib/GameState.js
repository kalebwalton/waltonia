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
    if (this.players[id]) {
      return this.players[id]
    } else {
      this.players[id] = {
        id: id,
        connected: true,
        x: Math.floor(Math.random() * 10) + 1,
        y: Math.floor(Math.random() * 10) + 1
      }
      return this.players[id]
    }
  }

  setPlayerConnected(id) {
    if (this.players[id]) {
      this.players[id].connected = true
    }
  }

  setPlayerDisconnected(id) {
    if (this.players[id]) {
      this.players[id].connected = false
    }
  }

  setPlayerXY(id, x, y) {
    if (this.players[id]) {
      this.players[id].x = x
      this.players[id].y = y
    }
  }

  getConnectedPlayers() {
    var ret = {}
    for (var id in this.players) {
      if (this.players[id].connected) {
        ret[id] = this.players[id]
      }
    }
    return ret
  }

}
export default GameState
