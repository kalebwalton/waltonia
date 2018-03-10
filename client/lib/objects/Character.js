import CharacterHighlight from './CharacterHighlight'
class Character extends Phaser.GameObjects.Sprite {
  constructor({scene, id, tile, texture, frame}) {
    texture = texture ? texture : 'character'
    frame = frame ? frame : 1
    console.log("TILE PIXELS", tile.pixelX, tile.pixelY, tile)
    super(scene, tile.pixelX, tile.pixelY, texture, frame)
    this.tile = tile
    this.id = id
    this.movementPath = []
    this.moving = false
    this.following = null
    this.followedBy = null
    this.movementDuration = 100
    this.texture = texture

    scene.physics.world.enable(this)
    this.setOrigin(0,0)
    this.setInteractive()
    this.tint = Math.random() * 0xffffff
    scene.add.existing(this)

    this.highlight = new CharacterHighlight({scene, x: tile.pixelX, y: tile.pixelY})
    this.highlightEnabled = true
    this.scene.anims.create({
      key: 'left',
      frames: this.scene.anims.generateFrameNumbers(this.texture, { start: 6, end: 7 }),
      frameRate: 10,
      repeat: -1
    });
    this.scene.anims.create({
      key: 'right',
      frames: this.scene.anims.generateFrameNumbers(this.texture, { start: 2, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    this.scene.anims.create({
      key: 'up',
      frames: this.scene.anims.generateFrameNumbers(this.texture, { start: 0, end: 1 }),
      frameRate: 10,
      repeat: -1
    });
    this.scene.anims.create({
      key: 'down',
      frames: this.scene.anims.generateFrameNumbers(this.texture, { start: 4, end: 5 }),
      frameRate: 10,
      repeat: -1
    });

  }

  updateScene(scene) {
    this.scene = scene
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

  handleFinalMovement(toTile) {
    var layerObjects = this.scene.sys.game.helper.getLayerObjectsAtTile(this.scene.map, toTile.x, toTile.y)
    if (layerObjects) {
      for (var lo of layerObjects) {
        switch(lo.objectLayerName) {
          case 'portals':
            var parts = lo.layerObject.name.split("_")
            this.emit('enterPortal', parts[0], parts[1], parts[2])
          default:
            break
        }
      }
    }
  }

  updateState({tile, followedBy, following}) {
    // Handle movement state. Only do a moveTo if we're not already on our way to moving there.
    if (tile !== undefined && (tile.x != this.tile.x || tile.y != this.tile.y)) {
      // Need to do getTileAt in case this is an update from the server which
      // won't be the actual tile reference. We use pixelX as a test.
      var toTile = tile.pixelX ? tile : this.scene.movement.getTileAt(tile.x, tile.y)
      if (toTile) {
        console.debug("Moving character to tile", toTile)
        this.handleMoveTo(toTile, () => {
          this.handleFinalMovement(toTile)
        })
      } else {
        console.warn("Character moved to an invalid tile", this, tile)
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
          this.scene.socket.emit('moveTo', {x: toTile.x, y: toTile.y})
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
    var fromTile = null
    if (mp && mp.length > 0) {
      fromTile = this.scene.movement.getTileAt(mp[0].x, mp[0].y);
    } else {
      fromTile = this.scene.movement.getTileAtObject(this);
    }
    this.pathTo(fromTile, toTile, path => {
      if (path && path.length > 0) {
        // If we're at rest then remove the first path item since it'll be the
        // current tile. But if we're in the middle of a movement then don't
        // do anything.
        if (this.x == fromTile.pixelX && this.y == fromTile.pixelY) {
          path.shift()
        }

        // If there is a character at the end of the path then pop it off.
        /*var lastPathItem = path[path.length-1]
        var characters = []
        characters = characters.concat(Object.values(this.scene.players))
        characters = characters.concat(Object.values(this.scene.mobs))
        var remove = false
        for (var character of characters) {
          var charTile = this.scene.movement.getTileAtObject(character)
          if (charTile.x == lastPathItem.x && charTile.y == lastPathItem.y) {
            remove = true
          }
        }
        if (remove) path.pop()*/
        this.movementPath = path
        if (!this.moving) {
          this.moveToByPath(callback)
        }
      }
    })
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
    this.scene.tweens.add({
      targets: [this, this.highlight],
      x: toTile.pixelX,// + this.body.offset.x,
      y: toTile.pixelY,// + this.body.offset.y,
      ease: 'None',
      duration: this.movementDuration,
      onComplete: () => {
        this.movementPath.shift()
        this.tile = toTile
        this.moveToByPath.call(this, callback)
      },
      onStart: () => {
        console.log("TILE COORDS", fromTile.x, fromTile.y,toTile.x, toTile.y )
        if (toTile.x < fromTile.x) {
          this.anims.play('left', true);
        } else if (toTile.x > fromTile.x) {
          this.anims.play('right', true);
        } else if (toTile.y < fromTile.y) {
          this.anims.play('up', true);
        } else if (toTile.y > fromTile.y) {
          this.anims.play('down', true);
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
