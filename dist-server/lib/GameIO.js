'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GameIO = function GameIO(config) {
  var _this = this;

  _classCallCheck(this, GameIO);

  this.io = config.io;
  this.state = config.state;
  this.io.on('connection', function (socket) {
    // Events
    // playerEnter: player enters game, provides unique id based on device hardware, we
    // lookup player and load his state
    //   emits: 'playerEnter' w/ state and all other player states
    //   broadcasts: 'otherPlayerEnter' w/ state
    // playerMoveTo: player requests to move somewhere, provides x,y tile, server
    // looks up collision/boundaries and replies with yes/no to movement
    //   emits: 'playerMoveTo' w/ state
    //   broadcasts: 'otherPlayerMoveTo' w/ state

    socket.on('playerConnect', function (id) {
      console.log("playerConnect", id);
      var player = _this.state.getPlayer(id);
      if (player && player.connected) {
        return;
      } else {
        _this.state.setPlayerConnected(player.id);

        socket.playerId = player.id;
        socket.emit('playerConnect', {
          player: player,
          players: _this.state.getConnectedPlayers()
        });
        socket.broadcast.emit('otherPlayerConnect', {
          player: player
        });
      }
    });

    socket.on('playerMoveTo', function (data) {
      var player = _this.state.getPlayer(socket.playerId);
      console.log("playerMoveTo", player);
      if (player.connected) {
        _this.state.setPlayerXY(socket.playerId, data.x, data.y);

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

    var playerDisconnectFn = function playerDisconnectFn() {
      var player = _this.state.getPlayer(socket.playerId);
      console.log("playerDisconnect", socket.player);
      if (player.connected) {
        _this.state.setPlayerDisconnected(socket.playerId);
        socket.emit('playerDisconnect');
        socket.broadcast.emit('otherPlayerDisconnect', {
          id: player.id
        });
      }
    };
    socket.on('playerDisconnect', playerDisconnectFn);
    socket.on('disconnect', playerDisconnectFn);
  });
};

exports.default = GameIO;