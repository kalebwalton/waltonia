
export const NEW_PLAYER = "NEW_PLAYER"
export const newPlayer = (name, socketId) => {
  return { type: NEW_PLAYER, name, socketId }
}

export const CLIENT_ERRORS_SENT = "CLIENT_ERRORS_SENT"
export const clientErrorsSent = (socketId) => {
  return { type: CLIENT_ERRORS_SENT, socketId }
}
