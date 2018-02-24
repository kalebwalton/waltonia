import Character from './Character'
class Player extends Character {
  constructor(config) {
    super(config)
    this.entered = config.entered
  }

  // Setters
  enter() {
    this.updateState({entered: true})
  }

  exit() {
    this.updateState({entered: false})
  }

  updateState(state) {
    var {entered} = state
    if (entered !== undefined) {
      this.entered = entered
    }
    super.updateState(state)
  }


}
export default Player
