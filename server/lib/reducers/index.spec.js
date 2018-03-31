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
  getPlayer
} from '../selectors/'
import {expect} from 'chai'

export const pn1='pn1'
export const pn2='pn2'
export const ps1='ps1'
export const ps2='ps2'
export const em1='em1'
export const em2='em2'
export const sid1='sid1'
export const sid2='sid2'

export const mockState = () => {
  return JSON.parse(JSON.stringify({
    players:{
      [pn1]: {
        name: pn1,
        password: ps1,
        email: em1,
        socketId: sid1
      },
      [pn2]: {
        name: pn2,
        password: ps2,
        email: em2,
        socketId: sid2
      }
    },
    clients:{
      [sid1]: {
        socketId: sid1,
        playername: pn1,
        errors: []
      },
      [sid2]: {
        socketId: sid2,
        playername: pn2,
        errors: []
      }
    }
  }))
}

describe('Reducers and actions', () => {
  var state
  beforeEach(() => {
    state = mockState()
  })

  describe('authenticate', () => {
    it('should succeed if valid username/password', () => {
      state = reducer(state, authenticate(pn1, ps1, sid1))
      expect(state.players).to.have.property(pn1)
      expect(state.clients).to.have.property(sid1)
      expect(state.clients[sid1].errors).to.be.empty
    })
    it('should error if player doesn\'t exist', () => {
      var bsid = "badsocketid"
      state = reducer(state, authenticate("badname", "badpass", bsid))
      expect(state.clients).to.have.property(bsid)
      expect(state.clients[bsid].errors[0]).to.equal(AUTH_PLAYER_DOES_NOT_EXIST)
    })
    it('should error if bad password', () => {
      state = reducer(state, authenticate(pn1, "badpass", sid1))
      expect(state.players).to.have.property(pn1)
      expect(state.clients).to.have.property(sid1)
      expect(state.clients[sid1].errors[0]).to.equal(AUTH_BAD_PASSWORD)
    })
    it('should error on existing socketId if signing in new socketId (like new device)', () => {
      var nsid = "newdevicesocketid"
      state = reducer(state, authenticate(pn1, ps1, nsid))
      expect(state.players).to.have.property(pn1)
      expect(state.clients).to.have.property(nsid)
      expect(state.clients[nsid].errors).to.be.empty
      expect(state.clients[sid1].errors).to.not.be.empty
      expect(state.clients[sid1].errors[0]).to.equal(AUTH_ON_OTHER_DEVICE)

    })
    it('should error if invalid username/password', () => {
      state = reducer(state, authenticate(undefined, ps1, "newsid"))
      expect(state.clients["newsid"].errors[0]).to.equal(AUTH_BAD_REQUEST)
    })

  })

  describe('register', () => {
    it('should error on existing player name', () => {
      var sid = 'testsid'
      state = reducer(state, register(pn1, "tp", "email@email.com", sid))
      expect(state.clients[sid].errors).to.not.be.empty
      expect(state.clients[sid].errors[0]).to.equal(REG_PLAYER_ALREADY_EXISTS)
    })
    it('should error on invalid arguments', () => {
      var sid = 'testsid'
      state = reducer(state, register(undefined, "testpass", "email@email.com", sid))
      expect(state.clients[sid].errors).to.not.be.empty
      expect(state.clients[sid].errors[0]).to.equal(REG_BAD_REQUEST)
    })
    it('should result in a new client and player on successful registration', () => {
      var sid = 'testsid'
      var pn = 'testplayer'
      state = reducer(state, register(pn, "testpass", "email@email.com", sid))
      expect(state.clients[sid].errors).to.be.empty
      expect(state.clients[sid]).to.have.property('playername', pn)
      expect(state.players).to.have.property(pn)
    })
  })

  describe('move to', () => {
    it('should error on invalid tile', () => {
      state = reducer(state, moveTo(-1, 1, sid1))
      expect(state.clients[sid1].errors).to.not.be.empty
      expect(state.clients[sid1].errors[0]).to.equal(MOVE_INVALID_TILE)
    })
    it('should create or update targetTile on valid tile', () => {
      //var oldState = {players:{'testname':{name:'testname', password:'testpass', targetTile: {x:1, y:1}}}, clients:{'testsocketid': {name: 'testname', errors: []}}}
      state = reducer(state, moveTo(2, 2, sid1))
      var player = getPlayer(state, sid1)
      expect(player).to.not.be.undefined
      expect(player.targetTile).to.not.be.undefined
      expect(player.targetTile).to.deep.equal({x:2,y:2})
      state = reducer(state, moveTo(3, 3, sid1))
      player = getPlayer(state, sid1)
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

  describe('clientErrorsSent', () => {
    it('should clear client errors when sent', () => {
      var state = reducer({players:{}, clients:{'testsocketid': {name:'testname', errors: [REG_BAD_REQUEST, AUTH_BAD_REQUEST]}}}, clientErrorsSent("testsocketid"))
      expect(state.clients['testsocketid'].errors).to.be.empty
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
