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
var initialState = {
  players: [],
  socketIdToPlayerName: {},
  socketIdToClientErrors: {}
}
export default class StoreManager {
  constructor(callback, mock = false) {
    this.loadState((state = initialState) => {
      callback(createStore(reducers, state))
    }, mock)
  }

  loadState(callback, mock) {
    if (mock) {
      callback({
        mock: true,
        players: [
          {id: '1', name: 'player1'},
          {id: '2', name: 'player2'}
        ],
        socketIdToPlayerName: {},
        socketIdToClientErrors: {}
      })
    } else {
      // FIXME implement
    }
  }

}
