import Character from './Character'

class Player extends Character {
  constructor({scene, id, name, tile, disableHighlight, cameraFollow}) {
    var texture = 'player'
    var type = 'player'
    var frame = 4
    super({id, scene, name, tile, texture, frame, type})
    if (disableHighlight) {
      this.highlightEnabled = false
    }
    if (cameraFollow) {
      this.scene.cameras.main.startFollow(this, true)
    }
  }

}
export default Player;
