import { createStore, applyMiddleware } from 'redux'
import reducers from '../reducers'
import thunk from 'redux-thunk';

/*
State Shape

{
  player: {
  },
  players: {

  }
}

*/
export default class StoreManager {
  constructor(callback, initialState) {
    this.loadState((state) => {
      callback(createStore(reducers, state, applyMiddleware(thunk)))
    }, initialState)
  }

  loadState(callback, state) {
    if (state) {
      callback(state)
    } else {
      // FIXME implement
    }
  }

}
