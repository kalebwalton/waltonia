import Character from './Character'

class Player extends Character {
  constructor({scene, id, tile}) {
    var texture = 'player'
    var frame = 1
    super({id, scene, tile, texture, frame})
  }

}
export default Player;
