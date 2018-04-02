import Controller from './Controller'
import StoreManager from './store/'
import {AUTH_BAD_REQUEST, AUTH_PLAYER_DOES_NOT_EXIST} from './errors/'
import {expect} from 'chai'
import {check} from './test/'
import {pn1, pn2, ps1, ps2, em1, em2, sid1, sid2, mockState} from './reducers/mock'
import io from 'socket.io-client';
import {gameStart} from './actions/'


describe('Controller', () => {
  var controller, io_client
  beforeEach(() => {
    return new Promise((resolve) => {
      new StoreManager((store) => {
        controller = new Controller({store, onStart: () => {
          resolve()
          io_client = io("http://localhost:3000");
        }})
        controller.store.dispatch(gameStart())
      }, mockState())
    });
  })
  afterEach(() => {
    io_client.removeAllListeners()
    io_client.close()
    controller.destroy()
  })

  it('should initialize the store and io', () => {
    expect(controller).to.have.property('store')
    expect(controller.store).to.not.be.undefined
  })
  describe('Events', () => {
    it('should error on authenticate without a name', (done) => {
      io_client.on('errors', (state) => {
        expect(state).to.not.be.undefined
        expect(state[0]).to.equal(AUTH_BAD_REQUEST)
        done()
      })
      io_client.emit('authenticate')
    })
    it('should return an existing player when authenticate with a playername that does exist', (done) => {
      io_client.on('tick', (state) => {
        expect(state).to.not.be.undefined
        expect(state).to.have.property('player')
        expect(state.player).to.have.property('name', pn1)
        done()
      })
      io_client.emit('authenticate', {playername: pn1, password: ps1})
    })
    it('should return an error when authenticate with a name that doesn\'t yet exist', (done) => {
      io_client.on('errors', (state) => {
        expect(state).to.not.be.undefined
        expect(state[0]).to.equal(AUTH_PLAYER_DOES_NOT_EXIST)
        done()
      })
      io_client.emit('authenticate', {playername: 'bad', password: 'bad'})
    })
    it('should tick with relevant server state to be reflected in the client', (done) => {
      io_client.on('tick', (state) => {
        expect(state).to.not.be.undefined
        expect(state).to.have.property('players')
        expect(state).to.have.property('player')
        done()
      })
      io_client.emit('authenticate', {playername: pn1, password: ps1})
    })
    describe('Authenticated Events', () => {
      beforeEach(() => {
        return new Promise((resolve) => {
          io_client.removeAllListeners('tick')
          io_client.emit('authenticate', {playername: pn1, password: ps1})
          setTimeout(() => {
            resolve()
          }, 50)
        });
      })

      it('should tick with new targetTile on moveTo', (done) => {
        io_client.on('tick', (state) => {
          expect(state).to.have.property('player')
          expect(state.player.targetTile).to.deep.equal({x: 5, y: 10})
          done()
        })
        io_client.emit('moveTo', {x: 5, y: 10})
      })
    })

    /*it('should throw an error if trying to create a new player with a name that already exists', (done) => {
      io_client.on('enterWorld', (state) => {
        expect(state).to.not.be.undefined
        expect(state).to.have.property('error', 'PLAYER_NAME_TAKEN')
        done()
      })
      io_client.emit('enterWorld', {name: 'player1'})
    })*/
  })

  // describe('Player Interaction', () => {
  //   var player_io_client
  //   beforeEach(() => {
  //     player_io_client = io("http://localhost:3000");
  //     player_io_client.emit('authenticate', {playername: 'player1'})
  //   })
  //   afterEach(() => {
  //     player_io_client.removeAllListeners()
  //     player_io_client.close()
  //   })
  //
  //   it('should reflect movement target on next tick after a moveTo', (done) => {
  //     player_io_client.on('tick', (state) => {
  //       expect(state).to.have.property('player')
  //       expect(state.player).to.have.property('targetTile')
  //       expect(state.player.targetTile).to.have.property('x', 5)
  //       expect(state.player.targetTile).to.have.property('x', 8)
  //       done()
  //     })
  //     player_io_client.emit('moveTo', {x: 5, y: 8})
  //   })
  // })
})
