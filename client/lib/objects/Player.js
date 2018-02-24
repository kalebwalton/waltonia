import Character from './Character'

class Player extends Character {
  constructor({scene, id, tile, disableHighlight}) {
    var texture = 'player'
    var frame = 1
    super({id, scene, tile, texture, frame})
    if (disableHighlight) {
      this.highlightEnabled = false
    }
  }

}
export default Player;
