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
export const mid1='waltonia_over_0'
export const mn1='waltonia'
export const mt1='over'
export const ml1=0
export const mid2='waltonia_under_0'
export const mn2='waltonia'
export const mt2='under'
export const ml2=0

export const mockState = (testing = true) => {
  return JSON.parse(JSON.stringify({
    testing, // Use this in controller logic to make decisions around testing mode
    players: {
      [pid1]: {
        id: pid1,
        name: pn1,
        password: ps1,
        email: em1,
        tile: { x: 10, y:10 },
        mapId: mid1
      },
      [pid2]: {
        id: pid2,
        name: pn2,
        password: ps2,
        email: em2,
        tile: { x: 11, y:11 },
        mapId: mid2
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
    maps: {}
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
