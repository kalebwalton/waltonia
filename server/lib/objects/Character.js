class Character {
  constructor({scene, id, tile, entered}) {
    this.scene = scene
    this.id = id
    this.tile = tile
    this.tickInterval = 2000
    this.moving = false
    // This delay gives child classes a chance to initialize some variables
    // before the first tick
    setTimeout(() => {this.tick()}, 50)
  }

  moveTo(tile) {
    this.updateState({tile})
  }

  updateState({tile}) {
    if (tile && (tile.x != this.tile.x || tile.y != this.tile.y)) {
      this.tile = tile
      this.moving = true
      // Simulate movement time.
      // FIXME replace with path movement/calculation
      setTimeout(() => {
        this.moving = false
      }, this.tickInterval)
    }
  }

  tick() {
    setTimeout(() => {
      this.tick()
    }, this.tickInterval)
  }

}
export default Character
