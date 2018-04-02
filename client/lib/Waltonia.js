import 'phaser';
import Controller from './Controller'
import Helper from './utils/Helper'

class Waltonia extends Phaser.Game {
  constructor() {
    let config = {
      type: Phaser.WEB_GL,
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

    this.tint = Math.random() * 0xffffff

    this.helper = new Helper()
    this.controller = new Controller({sceneManager: this.scene, game: this})
    this.controller.changeLevel('waltonia', 'over', 0)
  }

}

export default Waltonia;
