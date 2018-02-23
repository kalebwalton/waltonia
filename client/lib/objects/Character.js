class Character extends Phaser.GameObjects.Sprite {
  constructor(id, scene, x, y, texture, frame) {
    texture = texture ? texture : 'player'
    frame = frame ? frame : 1
    super(scene, x, y, texture, frame)
    scene.physics.world.enable(this);
    this.body.offset = {x:8, y:8}
    scene.add.existing(this);

    this.id = id
    this.tile = this.scene.movement.getTileAtObject(this)
    this.targetTile = null
    this.movementPath = []
    this.moving = false
  }

  setState(state) {
    // Handle movement state. Only do a moveTo if we're not already on our way to moving there.
    if (state.tile.x != this.tile.x || state.tile.y != this.tile.y) {
      var mp = this.movementPath
      var lastPathItem = mp.length > 0 ? mp[mp.length-1] : null
      if (!lastPathItem || (lastPathItem.x != state.tile.x || lastPathItem.y != state.tile.y)) {
        this.moveTo(this.scene.movement.getTileAt(state.tile.x, state.tile.y))
      }
    }
  }

  pathTo(fromTile, toTile, callback) {
    let easystar = this.scene.easystar
    // var fromTile = scene.map.getTileAtWorldXY(fromX, fromY)
    // var toTile = scene.map.getTileAtWorldXY(toX, toY)
    easystar.findPath(fromTile.x, fromTile.y, toTile.x, toTile.y, callback);
    easystar.calculate();
  }

  moveTo(toTile, callback) {
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
