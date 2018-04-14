export const REGISTER = "REGISTER"
export const register = (playername, password, email, socketId) => {
  return { type: REGISTER, playername, password, email, socketId }
}


/*
- Client requests movement to tile
- Server updates targetTile and movement on player, and begins updating tile on
  player based on speed
- Client receives ticks as usual. Ticks contain player tile, targetTile and movement
  - Player state is sent to Player object updateState
  - Player object detects change in tile, targetTile and movement (deep comparison)
    and makes decision on what to do with the new state.
    - If state movement is defined and is different than player movement
      - Set movement on player and continue to move player along the movement.path (see below)
    - If state movement is not defined
      - Set bit to clear movement from player on movement completion (if moving)
  - On every tick player objects check if their movement is defined, if so
    - If movement is different than activeMovementPath
      - If player tile is not on movement path
        - (eventually do 'catch up' pathfinding, but for now just snap to closest tile on movement path)
      - If player tile is not equal to the last tile in the movement
        - Copy movement.path to activeMovement.path
        - Reverse search path until current player.tile is found, then update
          activeMovement.pointer

*/
