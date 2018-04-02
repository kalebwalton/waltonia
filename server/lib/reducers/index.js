import reduceReducers from 'reduce-reducers'
import {
  NEW_PLAYER,
  CLIENT_ERRORS_SENT,
  REGISTER,
  AUTHENTICATE,
  DISCONNECT,
  MOVE_TO,
  GAME_START
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
import { getPlayerByName, getPlayer, getPlayerByNameAndPassword, getClient, hasClientErrors } from '../selectors/'

const createClient = (socketId) => {
  return {socketId, errors:[]}
}

const createPlayer = (playername, password, email, socketId) => {
  return {name: playername, password, email, socketId, tile: {x:Math.floor(Math.random()*10+10),y:Math.floor(Math.random()*10+10)}}
}

const clientsReducer = (state = {}, action) => {
  var nstate = {...state}
  var {socketId} = action

  // We always need a valid client
  var client, errors
  if (socketId) {
    client = getClient(state, socketId)
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
      } else {
        client = {
          ...client,
          playername
        }
      }

      break

    case AUTHENTICATE:
      var {playername, password, socketId} = action
      if (!playername || !password) {
        errors.push(AUTH_BAD_REQUEST)
      }
      var player = getPlayerByName(state, playername)
      if (player) {
        if (player.password != password) {
          errors.push(AUTH_BAD_PASSWORD)
          break
        }
        // If the player has a socketId already and is getting a new one, then update
        // the existing client to have errors.
        if (player.socketId && player.socketId != socketId) {
          nstate = {
            ...nstate,
            clients: {
              ...nstate.clients,
              [player.socketId]: {
                ...client,
                errors: [
                  ...client.errors,
                  AUTH_ON_OTHER_DEVICE
                ]
              }
            }
          }
        }
        client = {
          ...client,
          playername
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

    case CLIENT_ERRORS_SENT:
      // Just clear the errors completely so the fall through
      // logic will create a new client with no errors
      errors = []
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
        errors
      }
    }
  }
}

const playersReducer = (state = {}, action) => {
  var {socketId} = action
  // Handle this condition special for AUTHENTICATE actions because of AUTH_ON_OTHER_DEVICE
  if (hasClientErrors(state, socketId) && action.type != AUTHENTICATE) {
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
      var player = getPlayer(state, socketId)
      if (player) {
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
      } else {
        return {...state}
      }

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
  clientsReducer,
  playersReducer
)
