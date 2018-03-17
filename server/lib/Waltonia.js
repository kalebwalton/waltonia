import MapScene from './MapScene'
import Controller from './Controller'
import StoreManager from './store/index'

class Waltonia {
  constructor(config) {
    new StoreManager(this.onStoreLoad)
  }

  onStoreLoad(store) {
    this.store = store
    this.controller = new Controller({store})
  }

}
export default Waltonia
