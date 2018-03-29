import Controller from './Controller'
import StoreManager from './store/index'

class Waltonia {
  constructor(config) {
    this.testing = config.testing
    this.storeManager = new StoreManager(this.onStoreLoad.bind(this), this.testing)
  }

  onStoreLoad(store) {
    this.store = store
    this.controller = new Controller({store, testing: this.testing})
  }

  destroy() {
    this.controller.destroy()
  }

}
export default Waltonia
