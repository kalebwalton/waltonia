import Player from '../objects/Player'
import Movement from '../utils/Movement'
import io from 'socket.io-client';

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
    this.players = {}
    this.url = new URL(window.location.href);

    this.socket = io(this.url.protocol+"//"+this.url.hostname+":3002", {forceNew: true});

    var socket = this.socket

    socket.on('playerMoveTo', (data) => {
      console.log("playerMoveTo: ", data)
      this.onPlayerMoveTo(data.x, data.y)
    })
    socket.on('otherPlayerMoveTo', (data) => {
      console.log("otherPlayerMoveTo: ", data)
      this.onOtherPlayerMoveTo(data.id, data.x, data.y)
    })
    socket.on('playerLeave', () => {
      console.log("playerLeave")
      this.onPlayerLeave()
    })
    socket.on('otherPlayerLeave', (data) => {
      console.log("otherPlayerLeave: ", data)
      this.onOtherPlayerLeave(data)
    })
    socket.on('playerEnter', (data) => {
      console.log("playerEnter: ", data)
      this.onPlayerEnter(data)
    })
    socket.on('otherPlayerEnter', (data) => {
      console.log("otherPlayerEnter: ", data)
      this.onOtherPlayerEnter(data.player)
    })

  }

  createMap() {
    this.map = this.make.tilemap({ key: 'map', tileWidth: 16, tileHeight: 16 });
    var tileset = this.map.addTilesetImage('tiles');
    this.layer = this.map.createStaticLayer(0, tileset, 0, 0);

    //  This isn't totally accurate, but it'll do for now
    this.map.setCollisionBetween(54, 83);
  }

  initPlayer() {
    var playerId = this.url.searchParams.get("id");
    this.socket.emit('playerEnter', playerId)
    console.debug("INIT PLAYER")
  }

  onPlayerLeave() {
    if (this.player) {
      this.player.destroy()
    }
  }

  onOtherPlayerLeave(player) {
    if (this.players[player.id]) {
      console.log("Destroying ", this.players[player.id])
      this.players[player.id].destroy()
      delete this.players[player.id]
    }
  }

  onPlayerEnter(data) {
    if (!this.player) {
      var tile = this.movement.getTileAt(data.player.x, data.player.y)
      this.player = new Player(data.player.id, this, tile.pixelX+8, tile.pixelY+8);
      this.initCamera(this.player);
      for (var id in data.players) {
        if (id != data.player.id) {
          this.onOtherPlayerEnter(data.players[id])
        }
      }
    }
  }

  onOtherPlayerEnter(player) {
    if (!this.players[player.id]) {
      var tile = this.movement.getTileAt(player.x, player.y)
      this.players[player.id] = new Player(player.id, this, tile.pixelX, tile.pixelY);
    }
  }

  onPlayerMoveTo(x,y) {
    if (this.player) {
      var tile = this.movement.getTileAt(x,y)
      this.player.moveTo(tile)
    }
  }

  onOtherPlayerMoveTo(id, x, y) {
    if (this.players[id]) {
      var tile = this.movement.getTileAt(x,y)
      this.players[id].moveTo(tile)
    }
  }

  initCamera(player) {
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.startFollow(player, false);
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
      var tile = this.movement.getTileAtPointer(pointer)
      if (tile) {
        this.socket.emit('playerMoveTo', {x: tile.x, y: tile.y})
      }
    }, this);

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  create()
  {

    console.log("BOOTED");

    this.createMap();
    this.initPlayer();
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
