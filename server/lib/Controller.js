import express from 'express';
import babelify from 'express-babelify-middleware';
import path from 'path';
import http from 'http';
import io_server from 'socket.io';
import { newPlayer, clientErrorsSent, authenticate, requestMoveToTargetTile, disconnect, mapsRequest, tilesetsRequest, moveToTile} from './actions/'
import { getPlayerMovements, getClientErrors, getClients, getClientTickState, getClientByPlayerId, getPlayerById, getMapMeta} from './selectors/'


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
    this.onStart = config.onStart
    this.tickMovementsInterval = 250
    this.tickMovementsTimeout = null
    this.tickInterval = 250
    this.tickTimeout = null
    this.sockets = {}
    this.store = config.store

    // Wait for initial state to be in store before starting to tick
    this.unsubscribe = this.store.subscribe(() => {
      var first = !this.state
      this.updateStateFromStore()

      // Do this the first time
      if (first) {
        this.init()
        if (this.onStart) {
          this.onStart(this)
        }
      }

    })
  }

  init() {
    this.app = this.initApp()
    this.server = this.initServer()
    this.io = this.initIO()

    this.handlerMap = {
      authenticate: this.onAuthenticate,
      register: this.onRegister,
      requestMoveToTargetTile: this.onRequestMoveToTargetTile,
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

    this.dispatch(mapsRequest())
    this.dispatch(tilesetsRequest())

    this.tick()
    this.tickMovements()
  }

  tick() {
    this.emitAllClientErrors()
    this.emitClientTickState()

    // FIXME put tickInterval in the state
    this.tickTimeout = setTimeout(this.tick.bind(this), this.tickInterval);
  }

  // Could easily break this up to be on a per player basis, calculating each
  // players movements based on their movement speed.
  tickMovements() {
    let start = Date.now()
    let movements = getPlayerMovements(this.state)
    for (let playerId in movements) {
      //let playerId = playerIdRef
      let player = getPlayerById(this.state, playerId)
      let movement = movements[playerId]
      let mapMeta = getMapMeta(this.state, player.mapId)
      if (mapMeta) {
        mapMeta.pathfinder.calculate(player.tile.x, player.tile.y, movement.x, movement.y, (path) => {
          if (path && path.length > 1) {
            let client = getClientByPlayerId(this.state, playerId)
            if (client) {
              console.log("Dispatching for ", client.socketId, playerId)
              this.dispatch(moveToTile(path[1].x, path[1].y, client.socketId))
            } else {
              // FIXME deal with missing clients
              console.error("Could not find client for playerId "+playerId)
            }
          }
        })
      }
    }
    this.tickMovementsTimeout = setTimeout(this.tickMovements.bind(this), this.tickMovementsInterval)
  }

  emitClientTickState() {
    Object.keys(this.sockets).forEach(socketId => {
      var tickState = getClientTickState(this.state, socketId)
      if (tickState.player) {
        console.log("TICKSTATE", tickState.player.name, tickState.player.tile)
      }
      this.sockets[socketId].emit('tick', tickState)
    })
  }

  emitAllClientErrors() {
    var allClients = getClients(this.state)
    Object.keys(allClients).forEach(socketId => {
      var clientErrors = allClients[socketId].errors
      if (clientErrors && clientErrors.length > 0) {
        var socket = this.sockets[socketId]
        if (socket && clientErrors) {
          socket.emit('errors', clientErrors)
          this.dispatch(clientErrorsSent(socketId))
        }
      }
    })
  }

  /*

  */
  onAuthenticate(e) {
    var {data, socket} = e
    if (!data) {
      data = {}
    }
    console.log("Event: authenticate", socket.id, data)
    this.dispatch(authenticate(data.playername, data.password, socket.id))
  }

  /*
  Player is requesting to move to a specific tile. This is where we do a bunch
  of checks to see if they can go there, and if so, we set it as the target
  tile on the player state and initiate pathfinding for the player to eventually
  get them to the tile so we can set the actual tile for the player.

  Data: { x: int, y: int }
  */
  onRequestMoveToTargetTile(e) {
    var {socket, data} = e
    console.log("Event: requestMoveToTargetTile", socket.id, data)
    this.dispatch(requestMoveToTargetTile(data.x, data.y, socket.id))
  }

  /*
  Player disconnected from the game by closing the game.
  */
  onDisconnect(e) {
    this.dispatch(disconnect(e.socket.id))
  }

  /*
  Player performed a registration action.
  */
  onRegister(e) {
    var {data, socket} = e
    this.dispatch(register(data.playername, data.password, data.email, socket.id))
  }






  destroy() {
    if (this.tickTimeout) {
      clearTimeout(this.tickTimeout)
    }
    if (this.tickMovementsTimeout) {
      clearTimeout(this.tickMovementsTimeout)
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
    if (!this.state.testing) {
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

  updateStateFromStore() {
    this.state = this.store.getState()
  }
  dispatch(action) {
    this.store.dispatch(action)
  }

}
export default Controller
