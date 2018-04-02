'use strict'

import {expect} from 'chai'
import {check} from './test/'
import Waltonia from './Waltonia';
import {fs} from "mz";

describe('Waltonia', () => {
  var waltonia
  before(() => {
    waltonia = new Waltonia()
  })
  after(() => {
    setTimeout(() => {waltonia.destroy()}, 1000)
  })

  it('should result in a store and controller after a couple seconds', () => {
    return new Promise((resolve,reject) => {
      setTimeout(() => {
        expect(waltonia.store).to.not.be.undefined
        expect(waltonia.controller).to.not.be.undefined
        resolve()
      }, 1000);
    })
  }).timeout(5000)
})
