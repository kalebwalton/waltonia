import MainScene from './MainScene'
import GameController from './GameController'

class Waltonia {
  constructor(config) {
    this.scene = new MainScene()
    this.controller = new GameController({scene: this.scene})
  }

}
export default Waltonia
