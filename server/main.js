import Waltonia from './lib/Waltonia';
import {mockState} from './lib/reducers/mock'
var waltonia = new Waltonia({}, {
  ...mockState(false), // FIXME Remove this at some point... good for now until we get player registration going
  defaults: {
    mapId: 'test_over_0',
    spawnTile: {
      x:5, y:5
    }
  }
})
