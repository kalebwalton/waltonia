import GameState from './GameState'
import GameController from './GameController'

class Game {
  constructor(config) {
    this.state = new GameState()
    this.controller = new GameController({state: this.state})
  }

}
export default Game
