import { createStore } from 'redux'
import reducers from '../reducers'

/*
State Shape

{
  players: [
    {
      id: 'player1234',
      name: 'someplayer'
    }
  ],
  clientErrors: {
    'socket1234': [
      'PLAYER_NAME_TAKEN'
    ]
  }
}

*/

export default class StoreManager {
  constructor(callback, mock = false) {
    this.loadState((state) => {
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
        clientErrors: []
      })
    } else {
      // FIXME implement
    }
  }

}
