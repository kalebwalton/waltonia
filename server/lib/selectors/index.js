export function selectTickState(state) {
  var newState = {...state, players:{}}
  if (state.players) {
    for (var id in state.players) {
      newState.players[id] = selectPlayer(state.players[id])
    }
  }
  return newState
}

export function selectPlayers(players) {
  var newPlayers = {}
  for (var id in players) {
    newPlayers[id] = selectPlayer(players[id])
  }
  return newPlayers
}
export function selectPlayer(player) {
  return {
    id: player.id,
    tile: player.tile
  }
}
