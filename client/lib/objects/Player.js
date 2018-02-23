import Character from './Character'

class Player extends Character {
  constructor(id, scene, x, y) {
    var texture = 'player'
    var frame = 1
    super(id, scene, x, y, texture, frame)
  }

}
export default Player;
