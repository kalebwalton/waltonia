import express from 'express';
import babelify from 'express-babelify-middleware';
import path from 'path';
import http from 'http';
import io_server from 'socket.io';
import { newPlayer, clientErrorsSent, authenticate, moveTo, disconnect} from './actions/'
import { getPlayerByName, getPlayers, getClientErrors, getClientTickState } from './selectors/'


/*

General Event Flow

Authentication
- Client: authenticate(<credentials> + socketId)
- Server: onAuthenticate(<credentials> + socketId)
  - Action: authenticate(<credentials> + socketId)
    - Reducer: authenticate
      - Good = existing user, password good
      - If good:
        - If socketId set on existing player, set AUTH_ON_OTHER_DEVICE error message on socketIdToClientErrors and overwrite socketId on player
      - If no existing user:
        - Set AUTH_PLAYER_DOES_NOT_EXIST error message on socketIdToClientErrors
      - If bad password:
        - Set AUTH_BAD_PASSWORD on socketIdToClientErrors
    - Controller: tick
      - handleClientErrors
      - emit('tick', tickState) which will include the 'player', signifying successful auth


Registration
- Client: register(<credentials> + socketId)
- Server: onRegister(<credentials> + socketId)
  - Action: register(<credentials> + socketId)
    - Reducer: register
      - Good = no existing user
      - If good:
        - Create new player and set socketId on new player
      - If existing user:
        - Set AUTH_PLAYER_ALREADY_EXISTS error message on socketId
      - Controller: tick
        - handleClientErrors
        - emit('tick', tickState) which will include the 'player', signifying successful registration and auth

Error Handling
- Server: <any event sets state.socketIdToClientErrors>
  - Controller: tick()
    - Controller: handleClientErrors()
      - emit('clientErrors', ['LIST', 'OF', 'ERRORS'])
*/


class Controller {

  constructor(config) {
    this.tickInterval = 1000
    this.testing = config.testing
    this.store = config.store
    this.tickTimeout = null

    //this.scene = config.scene
    this.app = this.initApp()
    this.server = this.initServer()
    this.io = this.initIO()
    this.sockets = {}
    this.handlerMap = {
      authenticate: this.onAuthenticate,
      // enterWorld: this.onEnterWorld,
      moveTo: this.onMoveTo,
      disconnect: this.onDisconnect
    }
    this.io.on('connection', socket => {
      // Primarily so we can gracefully close all sockets when we destroy the controller
      this.sockets[socket.id] = socket
      socket.on('close', () => {
        delete this.sockets[socket.id]
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

  tick() {
    var clientErrors = getAllClientErrors(this.state())
    Object.keys(clientErrors).forEach(socketId => {
      var socket = this.sockets[socketId]
      if (socket && clientErrors) {
        socket.emit('errors', clientErrors[socketId])
        this.dispatch(clientErrorsSent(socketId))
      }
    })

    Object.keys(this.sockets).forEach(socketId => {
      socket.emit('tick', getClientTickState(this.state(), socket.id))
    })

    this.tickTimeout = setTimeout(() => {
      this.tick.bind(this)()
    }, this.tickInterval);
  }

  onAuthenticate(e) {
    var {data, socket} = e
    this.dispatch(authenticate(data.playername, data.password, socket.id))
  }

  /*
  Player is requesting to move to a specific tile. This is where we do a bunch
  of checks to see if they can go there, and if so, we set it as the target
  tile on the player state and initiate pathfinding for the player to eventually
  get them to the tile so we can set the actual tile for the player.

  Data: { x: int, y: int }
  */
  onMoveTo(e) {
    var {socket, data} = e
    this.dispatch(moveTo(socket.id, data.x, data.y))
  }

  /*
  Player disconnected from the game by closing the game.
  */
  onDisconnect(e) {
    this.dispatch(disconnect(e.socket.id))
  }






  destroy() {
    if (this.tickTimeout) {
      clearTimeout(this.tickTimeout)
    }
    this.io.close()
    Object.keys(this.sockets).forEach(socketId => {
      this.sockets[socketId].disconnect(true)
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
      console.debug('Server listening at port %d', port);
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

}
export default Controller
