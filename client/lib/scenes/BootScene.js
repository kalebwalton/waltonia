class BootScene extends Phaser.Scene {
  constructor(config) {
    super({
      key: 'BootScene'
    })
  }

  preload()
  {
//    this.load.image('tiles', 'assets/maps/tiles/combined/wilderness.png');
  }

  create()
  {
    console.log("BootScene");
    //this.scene.start('MainScene');
  }
}

export default BootScene;
