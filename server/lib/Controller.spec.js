import Controller from './Controller'
import StoreManager from './store/'
import {AUTH_BAD_REQUEST} from './errors/'
import {expect} from 'chai'
import {check} from './test/'
import io from 'socket.io-client';

describe('Controller', () => {
  var controller, io_client
  before(() => {
    return new Promise((resolve) => {
      new StoreManager((s) => {
        controller = new Controller({store: s, testing: true})
        resolve()
      }, true)
    });
  })
  after(() => {
    controller.destroy()
  })
  beforeEach(() => {
    io_client = io("http://localhost:3000");
  })
  afterEach(() => {
    io_client.removeAllListeners()
    io_client.close()
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
        expect(state.player).to.have.property('name', 'player1')
        done()
      })
      io_client.emit('authenticate', {playername: 'player1'})
    })
    it('should return an error when authenticate with a name that doesn\'t yet exist', (done) => {
      io_client.on('errors', (state) => {
        expect(state).to.not.be.undefined
        expect(state[0]).to.equal(AUTH_PLAYER_DOES_NOT_EXIST)
        done()
      })
      io_client.emit('authenticate', {playername: 'nonexistingplayer'})
    })
    it('should tick with relevant server state to be reflected in the client', (done) => {
      io_client.on('tick', (state) => {
        expect(state).to.not.be.undefined
        expect(state).to.have.property('players')
        expect(state).to.have.property('player')
        done()
      })
      io_client.emit('authenticate', {playername: 'player1'})
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
