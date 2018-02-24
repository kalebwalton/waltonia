import express from 'express';
import babelify from 'express-babelify-middleware';
import path from 'path';
import http from 'http';
import io_server from 'socket.io';
import GameState from './GameState'

class GameController {

  constructor(config) {
    this.state = config.state
    this.io = this.initIO()
    this.socketIdToPlayer = {}
    this.handlerMap = {
      enter: this.onEnter,
      moveTo: this.onMoveTo,
      disconnect: this.onExit,
      exit: this.onExit
    }
    this.tick()
    this.io.on('connection', socket => {
      for(var name in this.handlerMap) {
        let nameRef = name // Create a new reference or else 'name' gets the last reference
        socket.on(nameRef, data => {
          this.handlerMap[nameRef].bind(this)({nameRef, socket, data})
        })
      }
    });
  }

  initIO() {
    //FIXME Move the express stuff out sometime...
    var app = express();
    var server = http.createServer(app);
    var io = io_server(server);
    var port = process.env.PORT || 3002;

    server.listen(port, function () {
      console.log('Server listening at port %d', port);
    });
    var phaserDir = path.dirname(require.resolve('phaser'))
    app.get('/bundle.js', babelify('client/main.js', { watch: true, extensions: ['js'], ignore: ['phaser'] }, { presets: [ 'env' ]}));
    // noParse: [
    //  `${phaserDir}/renderer/webgl/pipelines/ForwardDiffuseLightPipeline.js`,
    //  `${phaserDir}/renderer/webgl/pipelines/BitmapMaskPipeline.js`,
    //  `${phaserDir}/renderer/webgl/pipelines/TextureTintPipeline.js`,
    //  `${phaserDir}/renderer/webgl/pipelines/FlatTintPipeline.js`
    //]
    app.use(express.static(path.join(__dirname, '../../public')));
    return io
  }

  getPlayer(socket) {
    return this.socketIdToPlayer[socket.id]
  }

  setPlayer(socket, player) {
    this.socketIdToPlayer[socket.id] = player
  }

  tick() {
    console.log("tick")
    this.io.sockets.emit('tick', this.state.getTickState())
    setTimeout(() => {
      this.tick.bind(this)()
    }, 1000);
  }

  onEnter(e) {
    console.log("enter")

    var {data, socket} = e
    var playerId = data
    var player = null
    if (playerId) {
      player = this.state.getPlayer(playerId)
    }
    if (!player) {
      player = this.state.newPlayer(playerId)
    }
    console.log("enter", playerId, player)
    this.setPlayer(socket, player)
    player.enter()

    socket.emit('enter', {
      player: player,
      players: this.state.getEnteredPlayers()
    });
    socket.broadcast.emit('otherEnter', {
      player: player
    });
  }

  onMoveTo(e) {
    var {socket, data} = e
    let player = this.getPlayer(socket)
    console.log("moveTo", player)
    if (player && player.entered) {
      player.moveTo(data.x, data.y)

      socket.emit('moveTo', {
        x: player.x,
        y: player.y
      });
    }
  }

  onExit(e) {
    var {socket} = e
    let player = this.getPlayer(socket)
    console.log("exit", player)
    if (player) {
      player.exit()
      socket.broadcast.emit('otherExit', {
        id: player.id
      });
    }
  }


}
export default GameController
