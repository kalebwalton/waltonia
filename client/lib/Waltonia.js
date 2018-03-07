import 'phaser';
import BootScene from './scenes/BootScene';
import MainScene from './scenes/MainScene';
import GameController from './GameController'

class Waltonia extends Phaser.Game {
  constructor() {
    let config = {
      type: Phaser.CANVAS,
      parent: 'content',
      width: 400,
      height: 400,
      backgroundColor: '#2d2d2d',
      pixelArt: true,
      physics: {
          default: 'arcade',
          arcade: {
              gravity: { y: 0 }
          }
      }
    }
    super(config)

    this.controller = new GameController({sceneManager: this.scene})
    let mainScene = new MainScene({map: {name: 'waltonia', type: 'over', level: 0}, controller: this.controller})
    this.controller.sceneName = mainScene.getKey()
    this.scene.add(mainScene.getKey(), mainScene, true)
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
