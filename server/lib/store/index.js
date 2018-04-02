import { createStore } from 'redux'
import reducers from '../reducers'

/*
State Shape

{
  players: {
    'someplayer': {
      name: 'someplayer',
      sourceTile: { x: 1, y: 1 },
      currentTile: { x: 1, y: 2 },
      targetTile: { x: 1, y: 3 }
    }
  },
  clients: {
    'someid': {
      playername: 'someplayer',
      errors: ['ERROR_1']
    }
  }
}

*/
export default class StoreManager {
  constructor(callback, initialState) {
    this.loadState((state) => {
      callback(createStore(reducers, state))
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
