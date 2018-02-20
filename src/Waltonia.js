import 'phaser';
import BootScene from './scenes/BootScene';
import MainScene from './scenes/MainScene';

class Waltonia extends Phaser.Game {
  constructor() {
    let config = {
      type: Phaser.CANVAS,
      parent: 'content',
      width: 800,
      height: 600,
      backgroundColor: '#2d2d2d',
      pixelArt: true,
      physics: {
          default: 'arcade',
          arcade: {
              gravity: { y: 0 }
          }
      },
      scene: [
        BootScene,
        MainScene
      ]
    }

    super(config)
  }
}

export default Waltonia;
