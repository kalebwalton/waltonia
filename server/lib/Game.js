import GameState from './GameState'
import GameIO from './GameIO'

class Game {
  constructor(config) {
    this.state = new GameState()
    this.io = new GameIO({io: config.io, state: this.state})
  }

}
export default Game
