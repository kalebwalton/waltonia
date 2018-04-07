import StoreManager from './'
import {expect} from 'chai'
import {check} from '../test/'

describe('StoreManager', () => {
  describe('"constructor"', () => {
    it('should load state without error', (done) => {
      new StoreManager((store) => {
        check(done, () => {
          expect(store).to.not.be.undefined
          expect(store.getState()).to.have.property('testing')
        })
      }, {"testing": true})
    })
  })
})
