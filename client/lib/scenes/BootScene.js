class BootScene extends Phaser.Scene {
  constructor(config) {
    super({
      key: 'BootScene'
    })
  }

  preload()
  {
//    this.load.image('tiles', 'assets/maps/tiles/combined/wilderness.png');
    this.load.tilemapTiledJSON('map', 'assets/maps/defs/wilderness.json');
    this.load.spritesheet('player', 'assets/sprites/players/female_warrior.png', { frameWidth: 20, frameHeight: 20 });
    this.load.spritesheet('mob', 'assets/sprites/mobs/little_flare.png', { frameWidth: 20, frameHeight: 20 });
    this.load.spritesheet('highlight', 'assets/sprites/highlight.png', { frameWidth: 20, frameHeight: 20 });
  }

  create()
  {
    console.log("BootScene");
    this.scene.start('MainScene');
  }
}

export default BootScene;
