import Character from './Character'
class Mob extends Character {
  constructor(config) {
    super(config)
    this.bounds = {from: {x: 1, y:1}, to: {x:20, y:20}}
  }

  randomMoveTo() {
    this.updateState({tile: {
      x: Math.floor(Math.random()*this.bounds.to.x+this.bounds.from.x),
      y: Math.floor(Math.random()*this.bounds.to.y+this.bounds.from.y)
    }})
    console.debug("Moved to:", this.tile)
  }

  tick() {
    if (!this.moving) {
      // this.randomMoveTo()
    }
    super.tick()
  }

}
export default Mob
