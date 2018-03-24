class Store {
  /*
  STATE SHAPE
  {
    players: {
      id_1: { ... }, id_2: { ... }
    },
    maps: {
      waltonia_over_0: {
        players: [id_1, id_2, id_3],
        mobs: {
          id_1: { ... }, id_2: { ...}
        }
      }
    }
  }*/
  constructor() {
    this.state = {
      players: {},
      maps: {
        waltonia_house_0: {

        },
        waltonia_over_0: {
          mob1: new Mob({id: 'mob1', scene: this, tile: {x: 10, y: 10}}),
          mob2: new Mob({id: 'mob2', scene: this, tile: {x: 11, y: 11}})
        },
        waltonia_under_0: {

        }
      }
    }
  }

  select(selector) {
    selector(this.state)
  }

  destroy() {
    this.state.destroy()
  }

}
