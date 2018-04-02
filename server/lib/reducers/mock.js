export const pn1='pn1'
export const pn2='pn2'
export const ps1='ps1'
export const ps2='ps2'
export const em1='em1'
export const em2='em2'
export const sid1='sid1'
export const sid2='sid2'

export const mockState = (testing = true) => {
  return JSON.parse(JSON.stringify({
    testing: testing, // Use this in controller logic to make decisions around testing mode
    players:{
      [pn1]: {
        name: pn1,
        password: ps1,
        email: em1,
        socketId: sid1,
        tile: { x: 10, y:10 }
      },
      [pn2]: {
        name: pn2,
        password: ps2,
        email: em2,
        socketId: sid2,
        tile: { x: 11, y:11 }
      }
    },
    clients:{
      [sid1]: {
        socketId: sid1,
        playername: pn1,
        errors: []
      },
      [sid2]: {
        socketId: sid2,
        playername: pn2,
        errors: []
      }
    }
  }))
}
