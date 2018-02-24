class Character extends Phaser.GameObjects.Sprite {
  constructor({scene, id, tile, texture, frame}) {
    texture = texture ? texture : 'character'
    frame = frame ? frame : 1

    super(scene, tile.pixelX+8, tile.pixelY+8, texture, frame)
    this.tile = tile
    this.id = id
    this.targetTile = null
    this.movementPath = []
    this.moving = false

    scene.physics.world.enable(this);
    this.body.offset = {x:8, y:8}
    scene.add.existing(this);

  }

  updateState({tile}) {
    // Handle movement state. Only do a moveTo if we're not already on our way to moving there.
    if (tile && tile.x != this.tile.x || tile.y != this.tile.y) {
      var mp = this.movementPath
      var lastPathItem = mp.length > 0 ? mp[mp.length-1] : null
      if (!lastPathItem || (lastPathItem.x != tile.x || lastPathItem.y != tile.y)) {
        // Need to do getTileAt in case this is an update from the server which won't be the actual tile
        this.handleMoveTo(this.scene.movement.getTileAt(tile.x, tile.y))
      }
    }
  }

  pathTo(fromTile, toTile, callback) {
    let easystar = this.scene.easystar
    easystar.findPath(fromTile.x, fromTile.y, toTile.x, toTile.y, callback);
    easystar.calculate();
  }

  moveTo(tile) {
    this.updateState({tile})
  }

  handleMoveTo(toTile, callback) {
    var fromTile = this.tile;
    this.pathTo(fromTile, toTile, path => {
      // Remove the first entry off the path since it's the current tile
      if (path) {
        path.shift()
        this.movementPath = path
        if (!this.moving) {
          this.moveToByPath(callback)
        }
      }
    })
  }

  moveToByPath(callback) {
    if (!this.movementPath || this.movementPath.length == 0) {
      this.targetTile = null
      this.moving = false
      if (callback) {
        callback();
      }
      return
    } else {
      this.moving = true
    }
    var pathItem = this.movementPath[0]
    var toTile = this.scene.movement.getTileAt(pathItem.x, pathItem.y)
    this.scene.tweens.add({
      targets: this,
      x: toTile.pixelX + this.body.offset.x,
      y: toTile.pixelY + this.body.offset.y,
      ease: 'None',
      duration: 50,
      onComplete: () => {
        this.movementPath.shift()
        this.tile = toTile
        this.moveToByPath.call(this, callback)
      }
    });
  }


}
export default Character;
