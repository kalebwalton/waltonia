import Character from './Character'

class Player extends Character {
  constructor({scene, id, name, tile, disableHighlight}) {
    var texture = 'player'
    var type = 'player'
    var frame = 4
    super({id, scene, name, tile, texture, frame, type})
    if (disableHighlight) {
      this.highlightEnabled = false
    }
  }

}
export default Player;
