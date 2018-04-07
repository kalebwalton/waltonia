import CharacterHighlight from './CharacterHighlight'

/*

Events:
- moveStart(character, fromTile)
- moveComplete(character, toTile)


*/
class Character extends Phaser.GameObjects.Sprite {
  constructor({scene, id, name, tile, texture, frame, type}) {
    texture = texture ? texture : 'character'
    frame = frame ? frame : 1
    super(scene, tile.pixelX, tile.pixelY, texture, frame)

    this.tile = tile
    this.id = id
    this.name = name
    this.textureName = texture

    this.movementPath = []
    this.moving = false
    this.following = null
    this.followedBy = null
    this.movementDuration = 100
    this.tint = Math.random() * 0xffffff


    this.initHighlight()
    this.initAnims(texture)

    scene.physics.world.enable(this)
    this.setOrigin(0,0)
    this.setInteractive()
    scene.add.existing(this)

  }

  initHighlight() {
    this.highlight = new CharacterHighlight({scene: this.scene, x: this.tile.pixelX, y: this.tile.pixelY})
    this.highlightEnabled = true
  }

  getAnimKey(suffix) {
    return this.textureName+suffix
  }

  initAnims() {
    if (!this.scene.anims.get(this.getAnimKey('left'))) {
      this.scene.anims.create({
        key: this.getAnimKey('left'),
        frames: this.scene.anims.generateFrameNumbers(this.textureName, { start: 6, end: 7 }),
        frameRate: 10,
        repeat: -1
      });
      this.scene.anims.create({
        key: this.getAnimKey('right'),
        frames: this.scene.anims.generateFrameNumbers(this.textureName, { start: 2, end: 3 }),
        frameRate: 10,
        repeat: -1
      });
      this.scene.anims.create({
        key: this.getAnimKey('up'),
        frames: this.scene.anims.generateFrameNumbers(this.textureName, { start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1
      });
      this.scene.anims.create({
        key: this.getAnimKey('down'),
        frames: this.scene.anims.generateFrameNumbers(this.textureName, { start: 4, end: 5 }),
        frameRate: 10,
        repeat: -1
      });
    }
  }

  showHighlight() {
    if (this.highlightEnabled) {
      this.highlight.setVisible(true)
    }
  }

  hideHighlight() {
    this.highlight.setVisible(false)
  }

  follow(character) {
    this.updateState({following: character})
  }

  notFollow() {
    this.updateState({following: null})
  }


  updateState({targetTile, followedBy, following}) {
    // Handle movement state. Only do a moveTo if we're not already on our way to moving there.
    if (targetTile !== undefined && (targetTile.x != this.tile.x || targetTile.y != this.tile.y)) {
      // Need to do getTileAt in case this is an update from the server which
      // won't be the actual tile reference. We use pixelX as a test.
      var toTile = targetTile.pixelX ? targetTile : this.scene.movement.getTileAt(targetTile.x, targetTile.y)
      if (toTile) {
        console.debug("Moving character to tile", toTile)
        this.emit('moveStart', this, this.scene.movement.getTileAtObject(this))
        this.handleMoveTo(toTile, () => {
          this.emit('moveComplete', this, toTile)
        })
      } else {
        console.warn("Character moved to an invalid tile", this, targetTile)
      }
    }
    if (following !== undefined) {
      if (following == null) {
        if (this.following) {
          this.following.hideHighlight()
        }
        if (this.followingInterval) {
          clearInterval(this.followingInterval)
        }
        this.following = null
      } else {
        if (this.following && this.following != following) {
          this.following.hideHighlight()
          if (this.followingInterval) {
            clearInterval(this.followingInterval)
          }
        }
        this.following = following
        this.following.showHighlight()
      }
      if (this.following) {
        this.followingInterval = setInterval(() => {
          var toTile = this.scene.movement.getTileAtObject(this.following)
          // Figure out a better answer to this... maybe piggy back on 'tick' from the server instead
          this.scene.controller.socket.emit('moveTo', {x: toTile.x, y: toTile.y})
        }, 250)
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
    var mp = this.movementPath

    // If the toTile is already on the movementPath then just ignore the call altogether
    for (let pathItem of this.movementPath) {
      if (pathItem.x == toTile.x && pathItem.y == toTile.y) {
        return
      }
    }

    mp.push({x: toTile.x, y: toTile.y})

    var fromTile = null
    if (mp && mp.length > 0) {
      fromTile = this.scene.movement.getTileAt(mp[0].x, mp[0].y);
    } else {
      fromTile = this.scene.movement.getTileAtObject(this);
    }



    if (!this.moving) {
      this.moveToByPath(callback)
    }
    //
    // this.pathTo(fromTile, toTile, path => {
    //   if (path && path.length > 0) {
    //     // If we're at rest then remove the first path item since it'll be the
    //     // current tile. But if we're in the middle of a movement then don't
    //     // do anything.
    //     if (this.x == fromTile.pixelX && this.y == fromTile.pixelY) {
    //       path.shift()
    //     }
    //
    //     var lastPathItem = path[path.length-1]
    //     var lastPathTile = this.scene.movement.getTileAt(lastPathItem.x, lastPathItem.y)
    //     var charTile = this.scene.movement.getTileAtObject(this)
    //     if (this.scene.isCharacterAtTile(lastPathTile, this)) {
    //       path.pop()
    //     }
    //     this.movementPath = path
    //     if (!this.moving) {
    //       this.moveToByPath(callback)
    //     }
    //   }
    // })
  }

  moveToByPath(callback) {
    if (!this.movementPath || this.movementPath.length == 0) {
      this.anims.stop();
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
    var fromTile = this.scene.movement.getTileAtObject(this)
    toTile.tint = Math.random() * 0xffffff
    this.scene.tweens.add({
      targets: [this, this.highlight],
      x: toTile.pixelX,// + this.body.offset.x,
      y: toTile.pixelY,// + this.body.offset.y,
      ease: 'None',
      duration: this.movementDuration,
      onComplete: () => {
        this.movementPath.shift()
        this.tile = toTile
        this.tile.tint = 0xffffff
        this.moveToByPath.call(this, callback)
      },
      onStart: () => {
        if (toTile.x < fromTile.x) {
          this.anims.play(this.getAnimKey('left'), true);
        } else if (toTile.x > fromTile.x) {
          this.anims.play(this.getAnimKey('right'), true);
        } else if (toTile.y < fromTile.y) {
          this.anims.play(this.getAnimKey('up'), true);
        } else if (toTile.y > fromTile.y) {
          this.anims.play(this.getAnimKey('down'), true);
        }
      }
    });
  }

  die() {
    this.destroy()
  }

  destroy() {
    console.log("DESTROYING", this)
    super.destroy()
  }


}
export default Character;
