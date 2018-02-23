import easystarjs from 'easystarjs';

class Movement {

  constructor(scene) {
    this.scene = scene
  }

  getTileAtPointer(pointer) {
    var scenePoint = pointer.positionToCamera(this.scene.cameras.main);
    return this.getTileAtWorldXY(scenePoint.x, scenePoint.y);
  }

  getTileAtObject(object) {
    return this.getTileAtWorldXY(object.body.x, object.body.y);
  }

  getTileAtWorldXY(x, y) {
    return this.scene.map.getTileAtWorldXY(x, y)
  }

  getTileAt(x, y) {
    return this.scene.map.getTileAt(x, y, false, 'layer')
  }


}
export default Movement
