import express from 'express';
import babelify from 'express-babelify-middleware';
import path from 'path';
import http from 'http';
import io_server from 'socket.io';
import { newPlayer, clientErrorsSent} from './actions/'
import { getPlayer, getPlayers, getClientErrors, getClientTickState } from './selectors/'

class Controller {

  constructor(config) {
    this.tickInterval = 1000
    this.testing = config.testing
    this.store = config.store
    this.tickTimeout = null

    this.socketByNewPlayerName = {}

    //this.scene = config.scene
    //this.store = new Store()
    this.app = this.initApp()
    this.server = this.initServer()
    this.io = this.initIO()
    this.sockets = []
    this.socketByPlayerName = {}
    this.handlerMap = {
      enterWorld: this.onEnterWorld//,

      //moveTo: this.onMoveTo,
      //disconnect: this.onExit,
      //exit: this.onExit
    }
    this.io.on('connection', socket => {
      // Primarily so we can gracefully close all sockets when we destroy the controller
      this.sockets.push(socket)
      socket.on('close', () => {
        this.sockets.splice(this.sockets.indexOf(socket), 1);
      });
      for(var name in this.handlerMap) {
        let nameRef = name // Create a new reference or else 'name' gets the last reference
        socket.on(nameRef, data => {
          this.handlerMap[nameRef].bind(this)({nameRef, socket, data})
        })
      }
    });

    this.tick()
  }

  destroy() {
    if (this.tickTimeout) {
      clearTimeout(this.tickTimeout)
    }
    this.io.close()
    this.sockets.forEach(socket => {
      socket.disconnect(true)
    })
    this.server.close()
  }

  initApp() {
    return express();
  }

  initServer() {
    var server = http.createServer(this.app);
    var phaserDir = path.dirname(require.resolve('phaser'))
    // This causes tests to hang
    if (!this.testing) {
      this.app.get('/bundle.js', babelify('client/main.js', { watch: true, extensions: ['js'], ignore: ['phaser'] }, { presets: [ 'env' ]}));
    }
    this.app.use(express.static(path.join(__dirname, '../../public')));
    var port = process.env.PORT || 3000;
    server.listen(port, function () {
      console.log('Server listening at port %d', port);
    });
    return server
  }

  initIO() {
    return io_server(this.server);
  }

  state() {
    return this.store.getState()
  }
  dispatch(action) {
    this.store.dispatch(action)
  }

  tick() {
    //this.io.sockets.emit('tick', selectTickState(this.scene.getTickState()))

    for (var name in this.socketByNewPlayerName) {
      var socket = this.socketByNewPlayerName[name]
      var player = getPlayer(this.state(), name)
      var clientErrors = getClientErrors(this.state(), socket.id)
      // Player has been created, we're good to send his info
      if (player) {
        socket.emit('enterWorld', player)
        delete this.socketByNewPlayerName[name]
      } else if (clientErrors) {
        socket.emit('enterWorld', {error: clientErrors[0]})
        this.dispatch(clientErrorsSent(socket.id))
        delete this.socketByNewPlayerName[name]
      }
    }

    for (var name in this.socketByPlayerName) {
      var socket = this.socketByPlayerName[name]
      socket.emit('tick', getClientTickState(this.state(), name, socket.id))
    }



    this.tickTimeout = setTimeout(() => {
      this.tick.bind(this)()
    }, this.tickInterval);
  }

  /*
    The client emits an 'enterWorld' event when entering the world, providing
    a username. If they don't provide a username we send an error back.
  */
  onEnterWorld(e) {
    var {data, socket} = e
    if (!data || !data['name']) {
      socket.emit('enterWorld', {error: "Player 'name' is required"});
      return
    }

    // Try to find the player in our state. If it doesn't exist, then create a new player.
    var player = getPlayer(this.state(), data['name'])
    if (player) {
      this.socketByPlayerName[data['name']] = socket
      socket.emit('enterWorld', player);
    } else {
      this.socketByNewPlayerName[data['name']] = socket
      this.dispatch(newPlayer(data['name'], socket.id))
    }

    return

    var {data, socket} = e
    var playerId = data
    var player = null
    if (playerId) {
      player = this.scene.getPlayer(playerId)
    }
    if (!player) {
      player = this.scene.newPlayer(playerId)
    }
    console.log("enter", playerId, player)
    this.setPlayer(socket, player)
    player.enter()

    socket.emit('enter', {
      player: selectPlayer(player),
      players: selectPlayers(this.scene.getEnteredPlayers())
    });
    socket.broadcast.emit('otherEnter', {
      player: selectPlayer(player)
    });
  }

  // YOU ARE REFACTORING THE SERVER SIDE

  onMoveTo(e) {
    var {socket, data} = e
    let player = this.getPlayer(socket)
    console.log("moveTo", player)
    if (player && player.entered) {
      player.moveTo({x:data.x, y:data.y})
      socket.emit('moveTo', selectPlayer(player));
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


  generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  newPlayer(id) {
    var id = id ? id : this.generateId()
    this.players[id] = new Player({scene:this, id, tile: {x: Math.floor(Math.random() * 10) + 5, y:Math.floor(Math.random() * 10) + 10}})
    return this.players[id]
  }


  getPlayer(socket) {
    console.log(socket.id)
    return this.socketIdToPlayer[socket.id]
  }

  setPlayer(socket, player) {
    this.socketIdToPlayer[socket.id] = player
  }



}
export default Controller
