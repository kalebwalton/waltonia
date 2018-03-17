import { createSelector } from 'reselect'
import createCachedSelector from 're-reselect'

export const getPlayers = state => state.players
const _getPlayerByName = (players, name) => {
  return players.find( e => e.name == name )
}
export const getPlayer = createCachedSelector(
  state => state,
  (state, name) => name,
  (state, name) => _getPlayerByName(getPlayers(state), name)
)(
  (state, name) => "player_"+name
);
export const getClientErrors = (state, socketId) => state.clientErrors['socketId']

export const getClientTickState = (state, name, socketId) => {
  var s = {
    player: getPlayer(state, name),
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
