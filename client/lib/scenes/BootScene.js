class BootScene extends Phaser.Scene {
  constructor(config) {
    super({
      key: 'BootScene'
    })
  }

  preload()
  {
    this.load.image('tiles', 'assets/tilemaps/tiles/waltonia_tiles_16.png');
    this.load.tilemapCSV('map', 'assets/tilemaps/csv/waltonia_level1.csv');
    this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 16, frameHeight: 16 });
  }

  create()
  {
    console.log("BOOTED");
    this.scene.start('MainScene');
  }
}

export default BootScene;
