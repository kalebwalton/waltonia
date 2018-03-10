import Character from './Character'

class Mob extends Character {
  constructor({scene, id, tile}) {
    var texture = 'mob'
    var frame = 4
    var type = 'mob'
    super({id, scene, tile, texture, frame, type})
  }
}
export default Mob;
