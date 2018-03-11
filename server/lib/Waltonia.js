import MapScene from './MapScene'
import Controller from './Controller'

class Waltonia {
  constructor(config) {
    this.scene = new MapScene()
    this.controller = new Controller({scene: this.scene})
  }

}
export default Waltonia
