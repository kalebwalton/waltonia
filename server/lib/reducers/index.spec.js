import reducer from './'
import {
  REGISTER, register,
  AUTHENTICATE, authenticate,
  CLIENT_ERRORS_SENT, clientErrorsSent,
  DISCONNECT, disconnect,
  REQUEST_MOVE_TO_TARGET_TILE, requestMoveToTargetTile,
  MOVE_TO_TILE, moveToTile,
  MAPS_LOAD, mapsLoad, mapsRequest,
  TILESETS_LOAD, tilesetsLoad, tilesetsRequest
} from '../actions/'
import {
  AUTH_PLAYER_DOES_NOT_EXIST,
  AUTH_BAD_PASSWORD,
  AUTH_BAD_REQUEST,
  AUTH_ON_OTHER_DEVICE,
  REG_PLAYER_ALREADY_EXISTS,
  REG_BAD_REQUEST,
  MOVE_INVALID_TILE,
} from '../errors/'
import {
  getPlayer, getPlayerByName, getTileType, getMap, getMapMeta, getTile
} from '../selectors/'
import {expect} from 'chai'
import {pn1, pn2, ps1, ps2, em1, em2, sid1, sid2, pid1, pid2, mockState} from './mock'
import easystarjs from 'easystarjs';



describe('Reducers and actions', () => {
  var state
  beforeEach(() => {
    state = mockState()
  })

  describe('authenticate', () => {
    it('should succeed if valid username/password', () => {
      state = reducer(state, authenticate(pn1, ps1, sid1))
      expect(state.clients).to.have.property(sid1)
      expect(state.clients[sid1].errors).to.be.empty
      expect(state.clients[sid1].playerId).to.equal(pid1)
    })
    it('should error if player doesn\'t exist', () => {
      var bsid = "badsocketid"
      state = reducer(state, authenticate("badname", "badpass", bsid))
      expect(state.clients).to.have.property(bsid)
      expect(state.clients[bsid].errors[0]).to.equal(AUTH_PLAYER_DOES_NOT_EXIST)
    })
    it('should error if bad password', () => {
      state = reducer(state, authenticate(pn1, "badpass", sid1))
      expect(state.players).to.have.property(pid1)
      expect(state.clients).to.have.property(sid1)
      expect(state.clients[sid1].errors[0]).to.equal(AUTH_BAD_PASSWORD)
    })
    it('should error on existing socketId if signing in new socketId (like new device)', () => {
      var nsid = "newdevicesocketid"
      state = reducer(state, authenticate(pn1, ps1, nsid))
      expect(state.players).to.have.property(pid1)
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
      var player = getPlayerByName(state, pn)
      expect(player).to.have.property('name', pn)
    })
  })

  describe('request move to target tile', () => {
    it('should error on invalid tile', () => {
      state = reducer(state, requestMoveToTargetTile(-1, 1, sid1))
      expect(state.clients[sid1].errors).to.not.be.empty
      expect(state.clients[sid1].errors[0]).to.equal(MOVE_INVALID_TILE)
    })
    it('should create or update players movement queue on valid tile', () => {
      //var oldState = {players:{'testname':{name:'testname', password:'testpass', targetTile: {x:1, y:1}}}, clients:{'testsocketid': {name: 'testname', errors: []}}}
      state = reducer(state, requestMoveToTargetTile(2, 2, sid1))
      var player = getPlayer(state, sid1)
      expect(player).to.not.be.undefined
      var movement = state.movements.players[player.id]
      expect(movement).to.not.be.undefined
      expect(movement.x).to.equal(2)
      expect(movement.y).to.equal(2)
      state = reducer(state, requestMoveToTargetTile(3, 3, sid1))
      movement = state.movements.players[player.id]
      expect(movement).to.not.be.undefined
      expect(movement.x).to.equal(3)
      expect(movement.y).to.equal(3)
    })
  })

  describe('move to tile', () => {
    it('should update player tile', () => {
      state = reducer(state, moveToTile(5, 5, sid1))
      var player = getPlayer(state, sid1)
      expect(player).to.not.be.undefined
      expect(player.tile).to.deep.equal({x:5,y:5})
    })
  })

  describe('disconnect', () => {
    it('should remove client', () => {
      state = reducer({players:{}, clients:{'testsocketid': {name: 'testname', errors: []}}}, disconnect("testsocketid"))
      expect(state.clients['testsocketid']).to.be.undefined
    })
  })

  describe('clientErrorsSent', () => {
    it('should clear client errors when sent', () => {
      state = reducer({players:{}, clients:{'testsocketid': {socketId: 'testsocketid', name:'testname', errors: [REG_BAD_REQUEST, AUTH_BAD_REQUEST]}}}, clientErrorsSent("testsocketid"))
      expect(state.clients['testsocketid'].errors).to.be.empty
    })
  })


  describe('maps related reductions', () => {
    var map
    beforeEach(() => {
      return new Promise((resolve) => {
        mapsRequest()(mapsAction => {
          tilesetsRequest()(tilesetsAction => {
            var {maps} = mapsAction
            var {tilesets} = tilesetsAction
            state = reducer(state, mapsLoad(maps))
            state = reducer(state, tilesetsLoad(tilesets))
            map = getMap(state, 'test_over_0')
            resolve()
          })
        })
      });
    })

    it('should load maps', () => {
      expect(map.layers).to.not.be.empty
    })

    it('should load map tiles metadata', () => {
      var tile1 = getTile(state, map.id, 0, 1)
      var tile2 = getTile(state, map.id, 2, 2)
      expect(tile1.type).to.equal('block')
      expect(tile2.type).to.equal('walk')
      expect(tile2.portal).to.equal('test_under_0')
    })

    it('should load map pathfinding metadata', () => {
      var mapMeta = getMapMeta(state, map.id)
      expect(mapMeta.pathfinder).to.not.be.undefined
    })

    it('should accurately pathfind based on metadata', (done) => {
      var pathfinder = getMapMeta(state, map.id).pathfinder
      pathfinder.calculate(6,7,6,5, path => {
        expect(path).to.deep.equal(
          [
            { x: 6, y: 7 },
            { x: 5, y: 7 },
            { x: 5, y: 6 },
            { x: 5, y: 5 },
            { x: 6, y: 5 }
          ]
        )
        done()
      })
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
