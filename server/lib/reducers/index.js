import reduceReducers from 'reduce-reducers'
import {
  NEW_PLAYER,
  CLIENT_ERRORS_SENT,
  REGISTER,
  AUTHENTICATE,
  DISCONNECT,
  MOVE_TO,
  GAME_START,
  MAPS_LOAD
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
import { getPlayerById, getPlayer, getPlayerByIdAndPassword, getClient, hasClientErrors, getClientByPlayerId, getPlayerByName} from '../selectors/'

const createClient = (socketId) => {
  return {socketId, errors:[]}
}

const createPlayer = (playername, password, email, socketId) => {
  return {id: Math.floor(Math.random()*10000), name: playername, password, email, socketId, tile: {x:Math.floor(Math.random()*10+10),y:Math.floor(Math.random()*10+10)}}
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
        var player = createPlayer(playername, password, email)
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

    case MOVE_TO:
      var {x,y} = action
      if (x<0 || y<0) {
        nstate = insertClientError(nstate, socketId, MOVE_INVALID_TILE)
        break
      }
      // This is where we want to do some target tile validation
      var player = getPlayer(nstate, socketId)
      if (player) {
        nstate = insertPlayer(nstate, {
          ...player,
          targetTile: {x,y}
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

const gameReducer = (state = {}, action) => {
  switch(action) {
    case GAME_START:
      return {...state}
    default:
      return {...state}
  }
}

const mapsReducer = (state = {}, action) => {
  switch(action.type) {
    case MAPS_LOAD:
      var {maps} = action
      return {...state, maps}
    default:
      return {...state}
  }
}

export default reduceReducers(
  gameReducer,
  playerInteractionReducer,
  mapsReducer
)
