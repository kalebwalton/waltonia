import easystarjs from 'easystarjs';

class Movement {

  constructor(scene) {
    this.scene = scene
    this.easystar = null
  }

  getEasystar() {
    if (!this.easystar && this.scene.map) {
      this.easystar = new easystarjs.js();
      let map = this.scene.map
      var mapData = []
      for (var x of map.layers[0].data) {
        let b = [];
        for (var y of x) {
          b.push(y.index)
        }
        mapData.push(b)
      }
      this.easystar.setGrid(mapData)
      let acceptableTiles = []
      for (var i=0;i<100;i++) { acceptableTiles.push(i) }
      acceptableTiles = acceptableTiles.filter( function( i ) {
        return !map.layers[0].collideIndexes.includes( i );
      } );
      this.easystar.setAcceptableTiles(acceptableTiles);
    }
    return this.easystar
  }

  getTileAtPointer(pointer) {
    var scenePoint = pointer.positionToCamera(this.scene.cameras.main);
    return this.scene.map.getTileAtWorldXY(scenePoint.x, scenePoint.y);
  }

  getTileAtObject(object) {
    return this.scene.map.getTileAtWorldXY(object.body.x, object.body.y);
  }

  pathTo(fromTile, toTile, callback) {
    let easystar = this.getEasystar()
    // var fromTile = scene.map.getTileAtWorldXY(fromX, fromY)
    // var toTile = scene.map.getTileAtWorldXY(toX, toY)
    easystar.findPath(fromTile.x, fromTile.y, toTile.x, toTile.y, callback);
    this.easystar.calculate();
  }

  moveTo(object, toTile, callback) {
    var fromTile = this.getTileAtObject(object);
    this.pathTo(fromTile, toTile, path => {
      // Remove the first entry off the path since it's the current tile
      path.shift()
      object.movementPath = path
      if (!object.moving) {
        this.moveToByPath(object, callback)
      }
    })
  }

  moveToByPath(object, callback) {
    // Consider caching movermentPath by object name or something so it's not
    // stored in the object itself
    if (!object.movementPath || object.movementPath.length == 0) {
      object.moving = false
      if (callback) {
        callback();
      }
      return
    } else {
      object.moving = true
    }
    var pathItem = object.movementPath.shift()
    var toTile = this.scene.map.getTileAt(pathItem.x, pathItem.y, true, 'layer')
    // var fromTile = this.getTileAtObject(object)
    this.scene.tweens.add({
      targets: object,
      x: toTile.pixelX + object.body.offset.x,
      y: toTile.pixelY + object.body.offset.y,
      ease: 'None',
      duration: 50,
      onComplete: () => {
        this.moveToByPath.call(this, object, callback)
      }
    });
  }

}
export default Movement
