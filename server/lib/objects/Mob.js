import Character from './Character'
class Mob extends Character {
  constructor(config) {
    super(config)
    this.bounds = {from: {x: 10, y:10}, range: {x:5, y:5}}
  }

  randomMoveTo() {
    this.updateState({tile: {
      x: Math.floor(Math.random()*this.bounds.range.x)+this.bounds.from.x,
      y: Math.floor(Math.random()*this.bounds.range.y)+this.bounds.from.y
    }})
    console.debug("Moved to:", this.tile)
  }

  tick() {
    if (!this.moving) {
      this.randomMoveTo()
    }
    super.tick()
  }

}
export default Mob
