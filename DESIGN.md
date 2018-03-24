Client
- Character
- Player
- Mob
- Controller
- MapScene
- Waltonia

Server
- Character
- Player
- Mob
- Controller
- MapScene
- Waltonia

Shared
- Utils
  - Selectors: Selects part of the game state



MOVEMENT
- Movement speed is determined by the player state coming from the server and is used to calculate how long it'll take to reach the tile
- Server is authority, if client/server don't match by about the time it would take to reach the tile, then the client will force movement to match server
- Flows
  - Player starts game
    - Client asks for name
  - Player enters name
    - Client authenticates with server using name
      - If name is new, generates an id
    - Server responds with appropriate slice of game state (player, map+mobs+players)
    - Client renders game based on state
  - Server constantly updates game state
    -
  - Player clicks target tile
    - If target tile has a player then client brings up player info
    - If target tile has a mob
    - If target tile has a shop
    - If target tile does not have the above
      - Client requests movement path from server
      - Server validates request
        - Target tile is walkable
        - Path to target tile is not blocked
        - Path to target tile is < 100 moves
      - Server responds with path


GAME STATE SHAPE
{
  players: {
    id_1: { ... }, id_2: { ... }
  },
  maps: {
    waltonia_over_0: {
      players: [id_1, id_2, id_3],
      mobs: {
        id_1: { ... }, id_2: { ...}
      }
    }
  }
}


GAME CONFIG
{

}
