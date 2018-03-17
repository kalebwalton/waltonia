import reduceReducers from 'reduce-reducers'
import { NEW_PLAYER, newPlayer, CLIENT_ERRORS_SENT, clientErrorsSent } from '../actions/'
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
            { id: action.name, name: action.name }
          ]
        }
      } else {
        var existingClientErrors = state.clientErrors[action.socketId]
        if (!existingClientErrors) existingClientErrors = []
        return {
          ...state,
          clientErrors: {
            ...state.clientErrors,
            [action.socketId]: [
              ...existingClientErrors,
              "PLAYER_NAME_TAKEN"
            ]
          }
        }
      }

    case CLIENT_ERRORS_SENT:
      var nstate = {...state}
      nstate.clientErrors = {...nstate.clientErrors}
      delete nstate.clientErrors[action.socketId]
      return nstate

    default:
      return {...state}
  }
}

export default reduceReducers(
  playerReducer
)
