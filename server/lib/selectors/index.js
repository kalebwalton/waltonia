import { createSelector } from 'reselect'
import createCachedSelector from 're-reselect'

// YOU ARE IN THE MIDDLE OF ADDING AN 'id' TO THE PLAYER


export const getPlayers = state => state.players
export const getPlayerById = (state, id) => getPlayers(state)[id]
export const getPlayerByName = (state, name) => {
  var players = getPlayers(state)
  for (var player of Object.values(players)) {
    if (player.name == name) {
      return player
    }
  }
}
export const getPlayer = (state, socketId) => {
  var client = getClient(state, socketId)
  return client && client.playerId ? getPlayerById(state, client.playerId) : undefined
}
export const getClients = state => state.clients
export const getClient = (state, socketId) => getClients(state)[socketId]
export const getClientByPlayerId = (state, playerId) => {
  var clients = getClients(state)
  for (var client of Object.values(clients)) {
    if (client.playerId == playerId) {
      return client
    }
  }
}
export const getClientErrors = (state, socketId) => {
  var client = getClient(state, socketId)
  return client ? client.errors : undefined
}
export const hasClientErrors = (state, socketId) => {
  var errors = getClientErrors(state, socketId)
  return errors && errors.length > 0
}
export const getClientTickState = (state, socketId) => {
  var s = {
    player: getPlayer(state, socketId),
    players: getPlayers(state)
  }
  return s
}


export function selectTickState(state) {
  return {
    ...state,
    players: selectPlayers(state.players),
    mobs: selectMobs(state.mobs)
  }
}

export function selectCharacter(character) {
  return {
    id: character.id,
    tile: character.tile
  }
}
export function selectPlayers(players) {
  var newPlayers = {}
  if (players) {
    for (var id in players) {
      newPlayers[id] = selectPlayer(players[id])
    }
  }
  return newPlayers
}
export function selectPlayer(player) {
  return {
    ...selectCharacter(player)
  }
}
export function selectMobs(mobs) {
  var newMobs = {}
  if (mobs) {
    for (var id in mobs) {
      newMobs[id] = selectMob(mobs[id])
    }
  }
  return newMobs
}
export function selectMob(mob) {
  return {
    ...selectCharacter(mob)
  }
}
