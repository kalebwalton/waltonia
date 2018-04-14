import reduceReducers from 'reduce-reducers'
import {
  REGISTER
} from '../actions/'
import {
  AUTH_BAD_REQUEST,
  AUTH_ON_OTHER_DEVICE,
  AUTH_PLAYER_DOES_NOT_EXIST,
  AUTH_BAD_PASSWORD,
  REG_BAD_REQUEST,
  REG_PLAYER_ALREADY_EXISTS,
  MOVE_INVALID_TILE
} from '../../../server/lib/errors/'
// import {} from '../selectors/'

const playerInteractionReducer = (state = {}, action) => {
  switch(action) {
    // case GAME_START:
    //   return {...state}
    default:
      return {...state}
  }
}

const gameReducer = (state = {}, action) => {
  switch(action) {
    // case GAME_START:
    //   return {...state}
    default:
      return {...state}
  }
}

export default reduceReducers(
  gameReducer,
  playerInteractionReducer
)
