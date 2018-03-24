import reducer from './'
import {NEW_PLAYER, newPlayer, ENTER_WORLD, enterWorld, CLIENT_ERRORS_SENT, clientErrorsSent} from '../actions/'
import {expect} from 'chai'

describe('Reducers and actions', () => {
  var state
  describe('newPlayer', () => {
    it('should add a new player to the state', () => {
      var state = reducer({ players: [] }, newPlayer("testname", "testsocketid"))
      expect(state.players).to.deep.include({name: "testname"})
    })
    it('should not add two players with the same name to the state', () => {
      var state = reducer({ players: [], socketIdToClientErrors: {} }, newPlayer("testname", "testsocketid1"))
      state = reducer(state, newPlayer("testname", "testsocketid2"))
      expect(state.players).to.have.lengthOf(1)
    })
  })
  describe('enterWorld', () => {
    it('should add a new socketIdToPlayerName mapping', () => {
      var state = reducer({ socketIdToPlayerName: {} }, enterWorld("testname", "testsocketid"))
      expect(state.socketIdToPlayerName).to.have.property('testsocketid', 'testname')
    })
  })
  describe('clientErrorsSent', () => {
    it('should clear clientErrors for a socketId', () => {
      state = reducer({ socketIdToClientErrors: { 'testsocketid': ['ERROR'] } }, clientErrorsSent("testsocketid"))
      expect(state.socketIdToClientErrors).to.not.have.property('testsocketid')
    })
  })
})
