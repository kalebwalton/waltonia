import reduceReducers from 'reduce-reducers'
import {
  NEW_PLAYER,
  CLIENT_ERRORS_SENT,
  ENTER_WORLD
} from '../actions/'
import { getPlayer } from '../selectors/'

const playerReducer = (state = {}, action) => {
  switch(action.type) {
    case NEW_PLAYER:
      var player = getPlayer(state, action.name)
      if (!player) {
        return {
          ...state,
          players: [
            ...state.players,
            { name: action.name }
          ]
        }
      } else {
        var existingClientErrors = state.socketIdToClientErrors[action.socketId]
        if (!existingClientErrors) existingClientErrors = []
        return {
          ...state,
          clientErrors: {
            ...state.socketIdToClientErrors,
            [action.socketId]: [
              ...existingClientErrors,
              "PLAYER_NAME_TAKEN"
            ]
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

const socketIdToPlayerNameReducer = (state = {}, action) => {
  switch(action.type) {
    case ENTER_WORLD:
      return {
        ...state,
        socketIdToPlayerName: {
          ...state.socketIdToPlayerName,
          [action.socketId]: action.name
        }
      }
    default:
      return {...state}
  }
}

export default reduceReducers(
  playerReducer,
  socketIdToPlayerNameReducer
)
