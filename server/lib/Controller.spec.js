import Controller from './Controller'
import StoreManager from './store/'
import {expect} from 'chai'
import {check} from './test/'
import io from 'socket.io-client';

describe('Controller', () => {
  var controller, io_client
  before(() => {
    return new Promise((resolve) => {
      new StoreManager((s) => {
        controller = new Controller({store: s, testing: true})
        io_client = io("http://localhost:3000");
        resolve()
      }, true)
    });
  })
  after(() => {
    io_client.close()
    controller.destroy()
  })
  afterEach(() => {
    io_client.removeAllListeners()
  })

  it('should initialize the store and io', () => {
    expect(controller).to.have.property('store')
    expect(controller.store).to.not.be.undefined
  })
  describe('Events', () => {
    it('should error on world entry without a name', (done) => {
      io_client.on('enterWorld', (state) => {
        expect(state).to.not.be.undefined
        expect(state).to.have.property('error')
        done()
      })
      io_client.emit('enterWorld')
    })
    it('should return an existing player when presented with a name that does exist', (done) => {
      io_client.on('enterWorld', (state) => {
        expect(state).to.not.be.undefined
        expect(state).to.have.property('name', 'player1')
        done()
      })
      io_client.emit('enterWorld', {name: 'player1'})
    })
    it('should return a new player when presented with a name that doesn\'t yet exist', (done) => {
      io_client.on('enterWorld', (state) => {
        expect(state).to.not.be.undefined
        expect(state).to.have.property('name', 'newplayer')
        done()
      })
      io_client.emit('enterWorld', {name: 'newplayer'})
    })
    it('should tick with relevant server state to be reflected in the client', (done) => {
      io_client.on('tick', (state) => {
        expect(state).to.not.be.undefined
        expect(state).to.have.property('players')
        expect(state).to.have.property('player')
        done()
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
})
