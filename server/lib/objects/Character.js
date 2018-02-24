class Character {
  constructor({scene, id, tile, entered}) {
    this.scene = scene
    this.id = id
    this.tile = tile
  }

  moveTo(tile) {
    this.updateState({tile})
  }

  updateState({tile}) {
    if (tile && (tile.x != this.tile.x || tile.y != this.tile.y)) {
      this.tile = tile
    }
  }

}
export default Character
