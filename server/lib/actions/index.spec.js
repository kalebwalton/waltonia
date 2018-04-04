import {mapsRequest, tilesetsRequest} from './'
import {expect} from 'chai'

describe('Fetchmaps', () => {
  it('should fetch maps', () => {
    mapsRequest()(action => {
      var maps = action.maps
      expect(maps).to.not.be.empty
      expect(maps[0].id).to.not.be.empty
      expect(maps[0].layers).to.not.be.empty
    })
  })
  it('should fetch tilesets', () => {
    tilesetsRequest()(action => {
      var tilesets = action.tilesets
      expect(tilesets).to.not.be.empty
      expect(tilesets[0].id).to.not.be.empty
    })
  })
})
