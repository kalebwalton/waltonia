import Controller from './Controller'
import StoreManager from './store/'
import {gameStart} from './actions/'

class Waltonia {
  constructor(config, initialState) {
    this.storeManager = new StoreManager(this.onStoreLoad.bind(this), initialState)
  }

  onStoreLoad(store) {
    this.store = store
    this.controller = new Controller({store})
    this.store.dispatch(gameStart())
  }

  destroy() {
    this.controller.destroy()
  }

}
export default Waltonia
