import { createStore } from 'redux'
import reducers from '../reducers'

/*
State Shape

{
  players: [
    {
      name: 'someplayer'
    }
  ],
  socketIdToPlayerName: {
    'socket1234': 'someplayer'
  },
  socketIdToClientErrors: {
    'socket1234': [
      'PLAYER_NAME_TAKEN'
    ]
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
