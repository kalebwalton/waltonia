import Player from '../objects/Player'
import Movement from '../utils/Movement'

class MainScene extends Phaser.Scene {
  constructor(config) {
    super({
      key: 'MainScene'
    })
  }

  preload()
  {
    this.movement = new Movement(this)
    this.speed = 100
  }

  createMap() {
    this.map = this.make.tilemap({ key: 'map', tileWidth: 16, tileHeight: 16 });
    var tileset = this.map.addTilesetImage('tiles');
    this.layer = this.map.createStaticLayer(0, tileset, 0, 0);

    //  This isn't totally accurate, but it'll do for now
    this.map.setCollisionBetween(54, 83);
  }

  initPlayer() {
    this.player = new Player(this, 24, 24);
  }

  initCamera(player) {
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.startFollow(player, true);
  }

  initDebug() {
    return
    this.debugGraphics = this.add.graphics();

    this.input.keyboard.on('keydown_C', e => {
        this.showDebug = !this.showDebug;
        this.drawDebug();
    });
    this.helpText = this.add.text(16, 16, this.getHelpMessage(), {
        fontSize: '18px',
        fill: '#ffffff'
    });
    this.helpText.setScrollFactor(0);
  }

  initInput() {
    ['UP', 'DOWN', 'LEFT', 'RIGHT'].forEach(key => {
      this.input.keyboard.on('keyup_'+key, e => {
        this.player.body.setVelocity(0)
      })
    })

    this.input.on('pointerdown', function (pointer) {
      var tileAtPointer = this.movement.getTileAtPointer(pointer)
      console.debug("TILE: ", tileAtPointer)
      this.player.moveTo(tileAtPointer)
    }, this);

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  create()
  {

    console.log("BOOTED");

    this.createMap();
    this.initPlayer();
    this.initCamera(this.player);
    this.initDebug();
    this.initInput();


    // Set up the player to collide with the tilemap layer. Alternatively, you can manually run
    // collisions in update via: this.physics.world.collide(player, layer).
    //this.physics.add.collider(this.player, this.layer);

  }

  update(time, delta) {
    // if (this.playerMoveTo && Phaser.Math.Fuzzy.Equal(this.playerMoveTo.x, this.player.body.gameObject.x, 1) && Phaser.Math.Fuzzy.Equal(this.playerMoveTo.y, this.player.body.gameObject.y, 1)) {
    //   this.playerMoveTo = null
    //   this.player.body.setVelocity(0)
    // }
  }

  drawDebug() {
    this.debugGraphics.clear();

    if (this.showDebug)
    {
        // Pass in null for any of the style options to disable drawing that component
        this.map.renderDebug(this.debugGraphics, {
            tileColor: null, // Non-colliding tiles
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200), // Colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Colliding face edges
        });
    }

    this.helpText.setText(this.getHelpMessage());
  }

  getHelpMessage () {
      return 'Arrow keys to move.' +
          '\nPress "C" to toggle debug visuals: ' + (this.showDebug ? 'on' : 'off');
  }


}

export default MainScene
