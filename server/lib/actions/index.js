export const REGISTER = "REGISTER"
export const register = (playername, password, email, socketId) => {
  return { type: REGISTER, playername, password, email, socketId }

}

export const AUTHENTICATE = "AUTHENTICATE"
export const authenticate = (playername, password, socketId) => {
  return { type: AUTHENTICATE, playername, password, socketId }
}

export const CLIENT_ERRORS_SENT = "CLIENT_ERRORS_SENT"
export const clientErrorsSent = (socketId) => {
  return { type: CLIENT_ERRORS_SENT, socketId }
}

export const DISCONNECT = "DISCONNECT"
export const disconnect = (socketId) => {
  return {type: DISCONNECT, socketId}
}

export const MOVE_TO = "MOVE_TO"
export const moveTo = (x, y, socketId) => {
  return {type: MOVE_TO, x, y, socketId}
}

export const GAME_START = "GAME_START"
export const gameStart = () => {
  return {type: GAME_START}
}
