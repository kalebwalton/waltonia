class GameIO {
  constructor(config) {
    this.io = config.io
    this.state = config.state
    this.io.on('connection', socket => {
      // Events
      // playerEnter: player enters game, provides unique id based on device hardware, we
      // lookup player and load his state
      //   emits: 'playerEnter' w/ state and all other player states
      //   broadcasts: 'otherPlayerEnter' w/ state
      // playerMoveTo: player requests to move somewhere, provides x,y tile, server
      // looks up collision/boundaries and replies with yes/no to movement
      //   emits: 'playerMoveTo' w/ state
      //   broadcasts: 'otherPlayerMoveTo' w/ state

      socket.on('playerConnect', id => {
        console.log("playerConnect", id)
        let player = this.state.getPlayer(id)
        if (player && player.connected) {
          return;
        } else {
          this.state.setPlayerConnected(player.id)

          socket.playerId = player.id
          socket.emit('playerConnect', {
            player: player,
            players: this.state.getConnectedPlayers()
          });
          socket.broadcast.emit('otherPlayerConnect', {
            player: player
          });
        }
      });

      socket.on('playerMoveTo', data => {
        let player = this.state.getPlayer(socket.playerId)
        console.log("playerMoveTo", player)
        if (player.connected) {
          this.state.setPlayerXY(socket.playerId, data.x, data.y)

          socket.emit('playerMoveTo', {
            x: player.x,
            y: player.y
          });
          socket.broadcast.emit('otherPlayerMoveTo', {
            id: player.id,
            x: player.x,
            y: player.y
          });
        }
      });

      var playerDisconnectFn = () => {
        let player = this.state.getPlayer(socket.playerId)
        console.log("playerDisconnect", socket.player)
        if (player.connected) {
          this.state.setPlayerDisconnected(socket.playerId)
          socket.emit('playerDisconnect')
          socket.broadcast.emit('otherPlayerDisconnect', {
            id: player.id
          });
        }
      }
      socket.on('playerDisconnect', playerDisconnectFn);
      socket.on('disconnect', playerDisconnectFn);
    });
  }
}
export default GameIO
