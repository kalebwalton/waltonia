export const pid1='x1234'
export const pid2='x1235'
export const pn1='pn1'
export const pn2='pn2'
export const ps1='ps1'
export const ps2='ps2'
export const em1='em1'
export const em2='em2'
export const sid1='sid1'
export const sid2='sid2'
export const mid1='test_over_0'
export const mid2='test_under_0'

export const mockState = (testing = true) => {
  return JSON.parse(JSON.stringify({
    testing, // Use this in controller logic to make decisions around testing mode
    players: {
      [pid1]: {
        id: pid1,
        name: pn1,
        password: ps1,
        email: em1,
        tile: { x: 1, y:1 },
        mapId: mid1
      },
      [pid2]: {
        id: pid2,
        name: pn2,
        password: ps2,
        email: em2,
        tile: { x: 1, y:2 },
        mapId: mid1
      }
    },
    clients: {
      [sid1]: {
        socketId: sid1,
        playerId: pid1,
        errors: []
      },
      [sid2]: {
        socketId: sid2,
        playerId: pid2,
        errors: []
      }
    },
    movements: {
      players: {
        /*
        [pid]: {
          x: 5,
          y: 5
        }
        */
      }
    },
    mapsMeta: {},
    maps: {},
    defaults: {
      mapId: 'test_over_0',
      spawnTile: {
        x:5, y:5
      }
    }
    // maps: {
    //   [mid1]: {
    //     name: mn1,
    //     type: mt1,
    //     level: ml1,
    //     layers: [
    //
    //     ]
    //   },
    //   [mid2]: {
    //     name: mn2,
    //     type: mt2,
    //     level: ml2
    //   }
    // }
  }))
}
