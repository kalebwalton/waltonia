import reduceReducers from 'reduce-reducers'
import {
  NEW_PLAYER,
  CLIENT_ERRORS_SENT,
  REGISTER,
  AUTHENTICATE,
  DISCONNECT,
  MOVE_TO
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
import { getPlayerByName, getPlayerBySocketId, getPlayerByNameAndPassword, getClientBySocketId, hasClientErrors } from '../selectors/'

const createClient = (socketId) => {
  return {socketId, errors:[]}
}

const createPlayer = (playername, password, email, socketId) => {
  return {name: playername, password, email, socketId}
}

const clientsReducer = (state = {}, action) => {
  var nstate = {...state}
  var {socketId} = action

  // We always need a valid client
  var client, errors
  if (socketId) {
    client = getClientBySocketId(state, socketId)
    if (!client) {
      client = createClient(socketId)
      nstate = {
        ...nstate,
        clients: {
          ...nstate.clients,
          [socketId]: client
        }
      }
    }
    errors = [...client.errors]
  }

  switch(action.type) {
    case REGISTER:
      var {playername, password, email} = action
      if (!playername || !password || !email) {
        errors.push(REG_BAD_REQUEST)
      }
      var player = getPlayerByName(state, playername)
      if (player) {
        errors.push(REG_PLAYER_ALREADY_EXISTS)
      }
      break

    case AUTHENTICATE:
      var {playername, password, socketId} = action
      if (!playername || !password) {
        errors.push(AUTH_BAD_REQUEST)
      }
      var player = getPlayerByName(state, playername)
      if (player) {
        if (player.socketId && player.socketId != socketId) {
          nstate = {...nstate, clients: { ...nstate.clients, [player.socketId]: {...nstate.clients[player.socketId], errors:[...nstate.clients[player.socketId].errors, AUTH_ON_OTHER_DEVICE]}}}
        }
        if (player.password != password) {
          errors.push(AUTH_BAD_PASSWORD)
        }
      } else {
        errors.push(AUTH_PLAYER_DOES_NOT_EXIST)
      }
      break

    case MOVE_TO:
      var {x,y} = action
      if (x<0 || y<0) {
        errors.push(MOVE_INVALID_TILE)
      }
      break

    case DISCONNECT:
      var nclients = {
        ...nstate.clients
      }
      delete nclients[socketId]
      return {
        ...nstate,
        clients: nclients
      }

    default:
      return {...nstate}
  }
  return {
    ...nstate,
    clients: {
      ...nstate.clients,
      [socketId]: {
        ...client,
        playername,
        errors
      }
    }
  }
}

const playersReducer = (state = {}, action) => {
  var {socketId} = action
  if (hasClientErrors(state, socketId)) {
    return {...state}
  }

  switch(action.type) {
    case REGISTER:
      var {playername, password, email} = action
      return {
        ...state,
        players: {
          ...state.players,
          [playername]: createPlayer(playername, password, email, socketId)
        }
      }

    case AUTHENTICATE:
      var {playername, password} = action
      var player = getPlayerByName(state, playername)
      if (player) {
        return {
          ...state,
          players: {
            ...state.players,
            [playername]: {
              ...player,
              socketId
            }
          }
        }
      } else {
        return {...state}
      }

    case MOVE_TO:
      var {x,y} = action
      // This is where we want to do some target tile validation
      var player = getPlayerBySocketId(state, socketId)
      return {
        ...state,
        players: {
          ...state.players,
          [player.name]: {
            ...player,
            targetTile: {x, y}
          }
        }
      }

    case CLIENT_ERRORS_SENT:
      var nstate = {...state}
      nstate.socketIdToClientErrors = {...nstate.socketIdToClientErrors}
      delete nstate.socketIdToClientErrors[action.socketId]
      return nstate

    default:
      return {...state}
  }
}

export default reduceReducers(
  clientsReducer,
  playersReducer
)
