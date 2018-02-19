class MainScene extends Phaser.Scene {
  constructor(config) {
    super({
      key: 'MainScene'
    })
    this.speed = 100
  }

  preload()
  {
  }

  create()
  {
    console.log("BOOTED");
    // When loading a CSV map, make sure to specify the tileWidth and tileHeight
    this.map = this.make.tilemap({ key: 'map', tileWidth: 16, tileHeight: 16 });
    var tileset = this.map.addTilesetImage('tiles');
    this.layer = this.map.createStaticLayer(0, tileset, 0, 0);

    //  This isn't totally accurate, but it'll do for now
    this.map.setCollisionBetween(54, 83);

    this.player = this.physics.add.sprite(48, 96, 'player', 1);

    // Set up the player to collide with the tilemap layer. Alternatively, you can manually run
    // collisions in update via: this.physics.world.collide(player, layer).
    this.physics.add.collider(this.player, this.layer);

    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.startFollow(this.player);

    this.debugGraphics = this.add.graphics();

    this.input.keyboard.on('keydown_C', function (event) {
        this.showDebug = !this.showDebug;
        this.drawDebug();
    });
    ['UP', 'DOWN', 'LEFT', 'RIGHT'].forEach(key => {
      this.input.keyboard.on('keyup_'+key, e => {
        this.player.body.setVelocity(0)
      })
    })

    this.input.on('pointerdown', function (pointer) {
        this.moveTo(pointer)
    }, this);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.helpText = this.add.text(16, 16, this.getHelpMessage(), {
        fontSize: '18px',
        fill: '#ffffff'
    });
    this.helpText.setScrollFactor(0);
  }

  update(time, delta) {

      if (this.playerMoveTo && Phaser.Math.Fuzzy.Equal(this.playerMoveTo.x, this.player.body.gameObject.x, 1) && Phaser.Math.Fuzzy.Equal(this.playerMoveTo.y, this.player.body.gameObject.y, 1)) {
        this.playerMoveTo = null
        this.player.body.setVelocity(0)
      }

      // Horizontal movement
      if (this.cursors.left.isDown)
      {
          this.player.body.setVelocityX(this.speed*-1);
      }
      else if (this.cursors.right.isDown)
      {
          this.player.body.setVelocityX(this.speed);
      }

      // Vertical movement
      if (this.cursors.up.isDown)
      {
          this.player.body.setVelocityY(this.speed*-1);
      }
      else if (this.cursors.down.isDown)
      {
          this.player.body.setVelocityY(this.speed);
      }

  }

  handle(p1, p2) {
    console.debug(p1, p2)
  }

  drawDebug() {
    this.debugGraphics.clear();

    if (this.showDebug)
    {
        // Pass in null for any of the style options to disable drawing that component
        this.map.renderDebug(debugGraphics, {
            tileColor: null, // Non-colliding tiles
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200), // Colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Colliding face edges
        });
    }

    helpText.setText(getHelpMessage());
  }

  moveTo(pointer) {
    var worldPoint = pointer.positionToCamera(this.cameras.main);
    var tile = this.map.getTileAtWorldXY(worldPoint.x, worldPoint.y)
    if (tile) {
      this.playerMoveTo = {x: tile.getCenterX(), y: tile.getCenterY()}
      this.physics.moveTo(this.player, this.playerMoveTo.x, this.playerMoveTo.y, this.speed)
    }
  }

  getHelpMessage () {
      return 'Arrow keys to move.' +
          '\nPress "C" to toggle debug visuals: ' + (this.showDebug ? 'on' : 'off');
  }


}

export default MainScene
