import reduceReducers from 'reduce-reducers'
import {
  NEW_PLAYER,
  CLIENT_ERRORS_SENT,
  REGISTER,
  AUTHENTICATE,
  DISCONNECT,
  REQUEST_MOVE_TO,
  UPDATE_PLAYER_TILE,
  GAME_START,
  MAPS_LOAD,
  TILESETS_LOAD
} from '../actions/'
import {
  AUTH_BAD_REQUEST,
  AUTH_ON_OTHER_DEVICE,
  AUTH_PLAYER_DOES_NOT_EXIST,
  AUTH_BAD_PASSWORD,
  REG_BAD_REQUEST,
  REG_PLAYER_ALREADY_EXISTS,
  MOVE_INVALID_TILE
} from '../errors/'
import {pn1, pn2, ps1, ps2, em1, em2, sid1, sid2, mockState} from './mock'
import {
  getPlayerById, getPlayer, getPlayerByIdAndPassword, getPlayerByName,
  getTileset, getLayer,
  getClient, hasClientErrors, getClientByPlayerId} from '../selectors/'
import Pathfinder from '../util/pathfinder'

const createClient = (socketId) => {
  return {socketId, errors:[]}
}

const createPlayer = (playername, password, email, mapId, socketId) => {
  return {
    id: Math.floor(Math.random()*10000),
    name: playername,
    password,
    email,
    mapId,
    socketId,
    tile: {x:Math.floor(Math.random()*10+10),y:Math.floor(Math.random()*10+10)}
  }
}

const insertClient = (state, newClient) => {
  var existingClient = getClient(state, newClient.socketId)
  return {
    ...state,
    clients: {
      ...state.clients,
      [newClient.socketId]: {
        ...existingClient,
        ...newClient
      }
    }
  }
}

const insertClientError = (state, socketId, error) => {
  var client = getClient(state, socketId)
  return {
    ...state,
    clients: {
      [socketId]: {
        ...client,
        errors: [
          ...client.errors,
          error
        ]
      }
    }
  }
}

const insertPlayer = (state, newPlayer) => {
  var existingPlayer = getPlayer(state, newPlayer.id)
  return {
    ...state,
    players: {
      ...state.players,
      [newPlayer.id]: {
        ...existingPlayer,
        ...newPlayer
      }
    }
  }
}

const playerInteractionReducer = (state = {}, action) => {
  var nstate = {...state}
  var {socketId} = action

  // We always need a valid client
  var client
  if (socketId) {
    client = getClient(nstate, socketId)
    if (!client) {
      client = createClient(socketId)
      nstate = insertClient(nstate, client)
    }
  }

  switch(action.type) {
    case REGISTER:
      var {playername, password, email} = action
      if (!playername || !password || !email) {
        nstate = insertClientError(nstate, socketId, REG_BAD_REQUEST)
        break
      }
      var player = getPlayerByName(nstate, playername)
      if (player) {
        nstate = insertClientError(nstate, socketId, REG_PLAYER_ALREADY_EXISTS)
        break
      } else {
        var player = createPlayer(playername, password, email, state.defaults.mapId)
        nstate = insertPlayer(nstate, player)
      }
      break

    case AUTHENTICATE:
      var {playername, password, socketId} = action
      if (!playername || !password) {
        nstate = insertClientError(nstate, socketId, AUTH_BAD_REQUEST)
        break
      }
      var player = getPlayerByName(nstate, playername)
      if (player) {
        if (player.password != password) {
          nstate = insertClientError(nstate, socketId, AUTH_BAD_PASSWORD)
          break
        }
        // If the player has a socketId already and is getting a new one, then update
        // the existing client to have errors.
        var playerClient = getClientByPlayerId(nstate, player.id)
        if (playerClient) {
          nstate = insertClientError(nstate, playerClient.socketId, AUTH_ON_OTHER_DEVICE)
        }
        nstate = insertClient(nstate, {
          ...client,
          playerId: player.id
        })
      } else {
        nstate = insertClientError(nstate, socketId, AUTH_PLAYER_DOES_NOT_EXIST)
      }
      break

    case REQUEST_MOVE_TO:
      var {x,y} = action
      if (x<0 || y<0) {
        nstate = insertClientError(nstate, socketId, MOVE_INVALID_TILE)
        break
      }

      // This is where we want to do some target tile validation
      var player = getPlayer(nstate, socketId)
      if (player) {
        nstate = {
          ...nstate,
          movements: {
            ...nstate.movements,
            players: {
              ...nstate.movements.players,
              [player.id]: { x, y }
            }
          }
        }
      }
      break

    case UPDATE_PLAYER_TILE:
      var {x,y} = action
      var player = getPlayer(nstate, socketId)
      if (player) {
        nstate = insertPlayer(nstate, {
          ...player,
          tile: {x,y}
        })
      }
      break


    case CLIENT_ERRORS_SENT:
      nstate = insertClient(nstate, {
        ...client,
        errors: []
      })
      break

    case DISCONNECT:
      var nclients = {
        ...nstate.clients
      }
      delete nclients[socketId]
      nstate = {
        ...nstate,
        clients: nclients
      }

    default:
      break
  }
  return nstate
}

// Depends on 'maps' and 'tilesets' being loaded into the state
const generateMapsMeta = (state) => {
  var {maps, tilesets} = state
  if (!maps || !tilesets || Object.values(maps).length == 0 || Object.values(tilesets).length == 0) {
    throw "generateMapsMeta called without tilesets or maps being in the state"
  }

  // Builds up a maps structure like:
  // {
  //   "test_over_0": {
  //     id: "test_over_0",
  //     tiles: {
  //       "2": { // y == 2
  //         "3": { // x == 3
  //           {gid:140,x:1,y:2,portal:'foo_over_0',type:'walk'}
  //         }
  //       }
  //     },
  //     pathfinder: (Pathfinder)
  //   }
  // }
  var mapsMeta = {}
  for (var map of maps) {
    var tilesetId = map.tilesets[0].source.substring(map.tilesets[0].source.lastIndexOf('/')+1).split(".")[0]
    var tileset = getTileset(state, tilesetId)
    if (!tileset) {
      throw `Tileset '${tilesetId}' referenced by map '${map.id}' not found`
    }

    var mapMeta = {
      mapId: map.id
    }
    mapsMeta[map.id] = mapMeta

    // TILES & PATHFINDING
    var mapLayer = getLayer(state, map.id, 'map')
    var tiles = {}
    var pathfinding = {
      grid: [],
      acceptableTileGids: [],
      doors: {}
    }
    mapMeta.tiles = tiles
    if (mapLayer) {
      var y = 0
      var x = 0
      for (var tgid of mapLayer.data) {
        tiles[y] = tiles[y] ? tiles[y] : {}
        tiles[y][x] = {
          gid: tgid,
          type: tileset.tiles[tgid].type
        }

        pathfinding.grid[y] = pathfinding.grid[y] ? pathfinding.grid[y] : []
        pathfinding.grid[y].push(parseInt(tgid))

        x++
        if (x >= mapLayer.width) {
          x = 0
          y++
        }
      }
    }

    var portalLayer = getLayer(state, map.id, 'portals')
    if (portalLayer) {
      for (var portal of portalLayer.objects) {
        var x = portal.x/portal.height
        var y = (portal.y-portal.height)/portal.height
        if (!mapMeta.tiles[y] || !mapMeta.tiles[y][x]) {
          throw `Tile not found to apply portal at x: ${x} y: ${y} in map ${map.id}`
        }
        mapMeta.tiles[y][x].portal=portal.name
      }
    }

    for (var tgid in tileset.tiles) {
      var type = tileset.tiles[tgid].type
      if ( type == "walk" || type == "door" ) {
        pathfinding.acceptableTileGids.push(parseInt(tgid))
      }
      if (type == "door") {
        pathfinding.doors[parseInt(tgid)] == true
      }
    }

    mapMeta.pathfinder = new Pathfinder(pathfinding.grid, pathfinding.acceptableTileGids, pathfinding.doors)

  }
  return {...state, mapsMeta}
}

const mapsReducer = (state = {}, action) => {
  switch(action.type) {
    case MAPS_LOAD:
      var {maps} = action
      var nstate = {...state, maps}
      if (state.tilesets && Object.values(state.tilesets).length > 0) {
        nstate = generateMapsMeta(nstate)
      }
      return nstate
    default:
      return {...state}
  }
}

const tilesetsReducer = (state = {}, action) => {
  switch(action.type) {
    case TILESETS_LOAD:
      var {tilesets} = action
      var nstate = {...state, tilesets}
      if (state.maps && Object.values(state.maps).length > 0) {
        nstate = generateMapsMeta(nstate)
      }
      return nstate
    default:
      return {...state}
  }
}

const gameReducer = (state = {}, action) => {
  switch(action) {
    case GAME_START:
      return {...state}
    default:
      return {...state}
  }
}

export default reduceReducers(
  gameReducer,
  playerInteractionReducer,
  mapsReducer,
  tilesetsReducer
)
