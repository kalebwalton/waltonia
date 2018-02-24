class BootScene extends Phaser.Scene {
  constructor(config) {
    super({
      key: 'BootScene'
    })
  }

  preload()
  {
    this.load.image('tiles', 'assets/tilemaps/tiles/wilderness.png');
    this.load.tilemapCSV('map', 'assets/tilemaps/csv/waltonia_wilderness.csv');
    this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 20, frameHeight: 20 });
    this.load.spritesheet('mob', 'assets/sprites/mob.png', { frameWidth: 20, frameHeight: 20 });
    this.load.spritesheet('highlight', 'assets/sprites/highlight.png', { frameWidth: 20, frameHeight: 20 });
  }

  create()
  {
    console.log("BootScene");
    this.scene.start('MainScene');
  }
}

export default BootScene;
