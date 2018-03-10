class Movement {

  constructor(scene) {
    this.scene = scene
  }

  getTileAtPointer(pointer) {
    var scenePoint = pointer.positionToCamera(this.scene.cameras.main);
    return this.getTileAtWorldXY(scenePoint.x, scenePoint.y);
  }

  getTileAtObject(object) {
    return this.getTileAtWorldXY(object.body.x+object.body.width/2, object.body.y+object.body.height/2);
  }

  getTileAtWorldXY(x, y) {
    if (this.scene.map) {
      return this.scene.map.getTileAtWorldXY(x, y)
    }
  }

  getTileAt(x, y) {
    if (this.scene.map) {
      return this.scene.map.getTileAt(x, y, false, this.scene.map.layers[0].name)
    }
  }

}
export default Movement
