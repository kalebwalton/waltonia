'use strict'

import {expect} from 'chai'
import {check} from './test/'
import Waltonia from './Waltonia';
import {fs} from "mz";
import {mockState} from './reducers/mock'

describe('Waltonia', () => {
  var waltonia
  before(() => {
    waltonia = new Waltonia({}, mockState())
  })
  after(() => {
    console.log("DESTROYING");
    waltonia.destroy()
  })

  it('should result in a store and controller after a couple seconds', () => {
    return new Promise((resolve,reject) => {
      setTimeout(() => {
        expect(waltonia.store).to.not.be.undefined
        expect(waltonia.controller).to.not.be.undefined
        resolve()
        console.log("RESOVLED")
      }, 1000);
    })
  }).timeout(5000)
})
