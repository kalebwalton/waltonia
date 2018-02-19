class BootScene extends Phaser.Scene {
  constructor(config) {
    super({
      key: 'BootScene'
    })
  }
  
  preload()
  {
    this.load.image('tiles', 'assets/tilemaps/tiles/catastrophi_tiles_16.png');
    this.load.tilemapCSV('map', 'assets/tilemaps/csv/main2.csv');
    this.load.spritesheet('player', 'assets/sprites/spaceman.png', { frameWidth: 16, frameHeight: 16 });
  }

  create()
  {
    console.log("BOOTED");
    this.scene.start('MainScene');
  }
}

export default BootScene;
