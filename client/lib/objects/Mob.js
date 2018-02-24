import Character from './Character'

class Mob extends Character {
  constructor({scene, id, tile}) {
    var texture = 'mob'
    var frame = 4
    super({id, scene, tile, texture, frame})
  }
}
export default Mob;
