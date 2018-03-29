import reducer from './'
import {
  REGISTER, register,
  AUTHENTICATE, authenticate,
  CLIENT_ERRORS_SENT, clientErrorsSent,
  DISCONNECT, disconnect,
  MOVE_TO, moveTo,
} from '../actions/'
import {
  AUTH_PLAYER_DOES_NOT_EXIST,
  AUTH_BAD_PASSWORD,
  AUTH_BAD_REQUEST,
  AUTH_ON_OTHER_DEVICE,
  REG_PLAYER_ALREADY_EXISTS,
  REG_BAD_REQUEST,
  MOVE_INVALID_TILE
} from '../errors/'
import {
  getPlayerBySocketId
} from '../selectors/'
import {expect} from 'chai'

describe('Reducers and actions', () => {
  // describe('newPlayer', () => {
  //   it('should add a new player to the state', () => {
  //     var state = reducer({ players: [] }, newPlayer("testname", "testsocketid"))
  //     expect(state.players).to.deep.include({name: "testname"})
  //   })
  //   it('should not add two players with the same name to the state', () => {
  //     var state = reducer({ players: [], socketIdToClientErrors: {} }, newPlayer("testname", "testsocketid1"))
  //     state = reducer(state, newPlayer("testname", "testsocketid2"))
  //     expect(state.players).to.have.lengthOf(1)
  //   })
  // })
  describe('authenticate', () => {
    it('should succeed if valid username/password', () => {
      var state = reducer({ players: {'testname':{name:'testname', password:'testpass'}}, clients: {} }, authenticate("testname", "testpass", "testsocketid"))
      expect(state.players).to.have.property('testname')
      expect(state.clients).to.have.property('testsocketid')
      expect(state.clients['testsocketid'].errors).to.be.empty
    })
    it('should error if player doesn\'t exist', () => {
      var state = reducer({ players: {}, clients: {} }, authenticate("testname", "testpass", "testsocketid"))
      expect(state.clients).to.have.property('testsocketid')
      expect(state.clients['testsocketid'].errors[0]).to.equal(AUTH_PLAYER_DOES_NOT_EXIST)
    })
    it('should error if bad password', () => {
      var state = reducer({ players: {'testname':{name:'testname', password:'otherpass'}}, clients: {} }, authenticate("testname", "testpass", "testsocketid"))
      expect(state.players).to.have.property('testname')
      expect(state.clients).to.have.property('testsocketid')
      expect(state.clients['testsocketid'].errors[0]).to.equal(AUTH_BAD_PASSWORD)
    })
    it('should error on existing socketId if signing in new socketId (like new device)', () => {
      var state = reducer({ players: {'testname':{name:'testname', password:'testpass', socketId: "existingsocketid"}}, clients: {"existingsocketid":{playername: 'testname', errors:[]} }}, authenticate("testname", "testpass", "testsocketid"))
      expect(state.players).to.have.property('testname')
      expect(state.clients).to.have.property('testsocketid')
      expect(state.clients['testsocketid'].errors).to.be.empty
      expect(state.clients['existingsocketid'].errors).to.not.be.empty
      expect(state.clients['existingsocketid'].errors[0]).to.equal(AUTH_ON_OTHER_DEVICE)

    })
    it('should error if invalid username/password', () => {
      var state = reducer({ players: {}, clients: {} }, authenticate(undefined, "testpass", "testsocketid"))
      expect(state.clients['testsocketid'].errors[0]).to.equal(AUTH_BAD_REQUEST)
    })

  })

  describe('register', () => {
    it('should error on existing player name', () => {
      var state = reducer({ players: {'testname':{name:'testname', password:'testpass'}}, clients: {} }, register("testname", "testpass", "email@email.com", "testsocketid"))
      expect(state.clients['testsocketid'].errors).to.not.be.empty
      expect(state.clients['testsocketid'].errors[0]).to.equal(REG_PLAYER_ALREADY_EXISTS)
    })
    it('should error on invalid arguments', () => {
      var state = reducer({ players: {'testname':{name:'testname', password:'testpass'}}, clients: {} }, register(undefined, "testpass", "email@email.com", "testsocketid"))
      expect(state.clients['testsocketid'].errors).to.not.be.empty
      expect(state.clients['testsocketid'].errors[0]).to.equal(REG_BAD_REQUEST)
    })
    it('should result in a new client and player on successful registration', () => {
      var state = reducer({ players: {}, clients: {} }, register("testuser", "testpass", "email@email.com", "testsocketid"))
      expect(state.clients['testsocketid'].errors).to.be.empty
      expect(state.clients['testsocketid']).to.have.property('playername', "testuser")
    })
  })

  describe('move to', () => {
    it('should error on invalid tile', () => {
      var state = reducer({players:{'testname':{name:'testname', password:'testpass'}}, clients:{'testsocketid': {name: 'testname', errors: []}}}, moveTo(-1, 1, "testsocketid"))
      expect(state.clients['testsocketid'].errors).to.not.be.empty
      expect(state.clients['testsocketid'].errors[0]).to.equal(MOVE_INVALID_TILE)
    })
    it('should create or update targetTile on valid tile', () => {
      var oldState = {players:{'testname':{name:'testname', password:'testpass', targetTile: {x:1, y:1}}}, clients:{'testsocketid': {name: 'testname', errors: []}}}
      var state = reducer(oldState, moveTo(2, 2, "testsocketid"))
      var player = getPlayerBySocketId(state,'testsocketid')
      expect(player.targetTile).to.not.be.undefined
      expect(player.targetTile).to.deep.equal({x:2,y:2})
      state = reducer(state, moveTo(3, 3, "testsocketid"))
      player = getPlayerBySocketId(state,'testsocketid')
      expect(player.targetTile).to.not.be.undefined
      expect(player.targetTile).to.deep.equal({x:3,y:3})
    })
  })

  describe('disconnect', () => {
    it('should remove client', () => {
      var state = reducer({players:{}, clients:{'testsocketid': {name: 'testname', errors: []}}}, disconnect("testsocketid"))
      expect(state.clients['testsocketid']).to.be.undefined
    })
  })
  // describe('clientErrorsSent', () => {
  //   it('should clear clientErrors for a socketId', () => {
  //     var state = reducer({ socketIdToClientErrors: { 'testsocketid': ['ERROR'] } }, clientErrorsSent("testsocketid"))
  //     expect(state.socketIdToClientErrors).to.not.have.property('testsocketid')
  //   })
  // })
  // describe('disconnect', () => {
  //   it('should remove socketId from mapping', () => {
  //     var state = reducer({ socketIdToClientErrors: { 'testsocketid': ['ERROR'] } , socketIdToPlayerName: { 'testsocketid': ['ERROR'] } }, disconnect("testsocketid"))
  //     expect(state.socketIdToPlayerName).to.not.have.property('testsocketid')
  //     expect(state.socketIdToClientErrors).to.not.have.property('testsocketid')
  //   })
  // })
  // describe('moveTo', () => {
  //   it('should update the target tile on the player', () => {
  //     var state = reducer({ players: [{name: "testname"}], socketIdToPlayerName: { 'testsocketid': 'testname' } }, moveTo("testsocketid", 5, 8))
  //     expect(state.players[0]).to.have.property('targetTile')
  //     expect(state.players[0].targetTile).to.have.property('x', 5)
  //     expect(state.players[0].targetTile).to.have.property('y', 8)
  //     expect(state.player).to.equal(state.players[0])
  //   })
  // })
})
