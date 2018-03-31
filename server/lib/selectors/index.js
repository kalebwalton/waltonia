import { createSelector } from 'reselect'
import createCachedSelector from 're-reselect'

// YOU ARE IN THE MIDDLE OF HEAVY REFACTORING OF ACTIONS AND STATE SHAPE... again


export const getPlayers = state => Object.values(state.players)
export const getPlayerByName = (state, name) => state.players[name]
export const getPlayer = (state, socketId) => {
  return getPlayerByName(state, getPlayerNameBySocketId(state, socketId))
}
export const getPlayerNameBySocketId = (state, socketId) => {
  var client = getClient(state, socketId)
  return client ? client.playername : undefined
}
export const getClients = state => Object.values(state.clients)
export const getClient = (state, socketId) => state.clients[socketId]
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
