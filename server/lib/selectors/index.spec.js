import { getPlayer, getPlayers } from './'
import {expect} from 'chai'
import {check} from '../test/'
import io from 'socket.io-client';

describe('Selectors', () => {
  var state = {
    players: [
      {id: '1', name: 'player1'},
      {id: '2', name: 'player2'}
    ]
  }
  it('should get players from state', () => {
    var players = getPlayers(state)
    expect(players).to.be.an('array')
    expect(players).to.not.be.empty
    expect(players).to.have.lengthOf(2)
  })
  it('should get player from state by name', () => {
    var player = getPlayer(state, 'player1')
    expect(player).to.have.property('name', 'player1')
  })
})
