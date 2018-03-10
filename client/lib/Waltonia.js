import 'phaser';
import BootScene from './scenes/BootScene';
import GameController from './GameController'
import Helper from './utils/Helper'

class Waltonia extends Phaser.Game {
  constructor() {
    let config = {
      type: Phaser.CANVAS,
      parent: 'content',
      // Need to make the following divisible by 20 to match the tiles or else we get some weird choppiness
      width: 2 * Math.round(Math.floor(window.innerWidth * window.devicePixelRatio/2) / 3),
      height: 2 * Math.round(Math.floor(window.innerHeight * window.devicePixelRatio/2) / 3)-4,
      backgroundColor: '#2d2d2d',
      pixelArt: true,
      zoom: 3,
      physics: {
          default: 'arcade',
          arcade: {
              gravity: { y: 0 }
          }
      }
    }
    super(config)

    this.helper = new Helper()
    this.controller = new GameController({sceneManager: this.scene, game: this})
    this.controller.changeLevel('waltonia', 'over', 0)
  }

  boot() {
    super.boot()
/*    setTimeout(() => {
      var s = this.scene
      s.getAt(s.getIndex('MainScene')).destroy()
      setTimeout(() => {
        var ns = new MainScene({mapName: 'wilderness', key: 'MainScene2', controller: this.controller})
        this.controller.sceneName = 'MainScene2'
        s.add('MainScene2', ns, true)
      }, 5000)
    },5000)*/
  }

}

export default Waltonia;
