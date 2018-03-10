import Character from './Character'

class Player extends Character {
  constructor({scene, id, tile, disableHighlight}) {
    var texture = 'player'
    var type = 'player'
    var frame = 4
    super({id, scene, tile, texture, frame, type})
    if (disableHighlight) {
      this.highlightEnabled = false
    }
  }

}
export default Player;
