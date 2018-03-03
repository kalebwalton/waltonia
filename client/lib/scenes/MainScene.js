import Player from '../objects/Player'
import Mob from '../objects/Mob'
import Movement from '../utils/Movement'
import io from 'socket.io-client';
import _ from 'underscore';
import easystarjs from 'easystarjs';


class MainScene extends Phaser.Scene {
  constructor(config) {
    super({
      key: 'MainScene'
    })
    this.easystar = null
  }

  preload()
  {
    this.movement = new Movement(this)
    this.speed = 100
    this.players = {}
    this.mobs = {}
    this.url = new URL(window.location.href);

    this.socket = io(this.url.protocol+"//"+this.url.hostname+":3000");

    var socket = this.socket

    socket.on('moveTo', (player) => {
      console.log("moveTo: ", player)
      this.onMoveTo(player)
    })
    socket.on('exit', () => {
      console.log("exit")
      this.onExit()
    })
    socket.on('otherExit', (data) => {
      console.log("otherExit: ", data)
      this.onOtherExit(data)
    })
    socket.on('enter', (data) => {
      console.log("enter: ", data)
      this.onEnter(data)
    })
    socket.on('otherEnter', (data) => {
      console.log("otherEnter: ", data)
      this.onOtherEnter(data.player)
    })
    socket.on('tick', (data) => {
      console.debug("tick: ", data)
      this.onTick(data)
    })

    this.load.tilemapTiledJSON('map', 'assets/maps/defs/wilderness.json');
    this.load.image('ground', 'assets/maps/tiles/combined/wilderness.png');
    this.load.spritesheet('player', 'assets/sprites/players/female_warrior.png', { frameWidth: 20, frameHeight: 20 });
    this.load.spritesheet('mob', 'assets/sprites/mobs/little_flare.png', { frameWidth: 20, frameHeight: 20 });
    this.load.spritesheet('highlight', 'assets/sprites/highlight.png', { frameWidth: 20, frameHeight: 20 });

  }

  createMap() {
    this.map = this.make.tilemap({ key: 'map', tileWidth: 20, tileHeight: 20 });
    var tileset = this.map.addTilesetImage('ground');
    var layer = this.map.createStaticLayer('ground', tileset);

    //  This isn't totally accurate, but it'll do for now
    var tileData = this.map.tilesets[this.map.getTilesetIndex('ground')].tileData;
    var collideIndexes = []
    for (var i in tileData) {
      switch (tileData[i].type) {
        case 'block':
        case 'sign':
        case 'stone':
        case 'tombstone':
        case 'tree':
        case 'well':
          collideIndexes.push(i)
          break

        case 'door':
        case 'grass':
        case 'gravel':
        case 'path':
        case 'sand':
        case 'stair':
        default:
          break
      }
    }
    console.log("Collide", collideIndexes)
    this.map.setCollision(collideIndexes, true, true, layer)
  }

  initPlayer() {
    var playerId = this.url.searchParams.get("id");
    this.socket.emit('enter', playerId)
    console.log("INIT PLAYER")
  }

  onDisconnect() {
    if (this.player) {
      this.player.destroy()
    }
  }

  onOtherExit(player) {
    if (this.players[player.id]) {
      console.log("Destroying ", this.players[player.id])
      this.players[player.id].destroy()
      delete this.players[player.id]
    }
  }

  onEnter(data) {
    if (!this.player) {
      var tile = this.movement.getTileAt(data.player.tile.x, data.player.tile.y)
      this.player = new Player({id: data.player.id, scene: this, tile});
      this.initCamera(this.player);
      for (var id in data.players) {
        if (id != data.player.id) {
          this.onOtherEnter(data.players[id])
        }
      }
    }
  }

  onOtherEnter(player) {
    if (!this.players[player.id]) {
      var tile = this.movement.getTileAt(player.tile.x, player.tile.y)
      this.players[player.id] = new Player({id: player.id, scene: this, tile});
      this.players[player.id].on('pointerdown', (pointer) => {
        this.onMobOrOtherPlayerClick(this.players[player.id])
      });
    }
  }

  onMoveTo(player) {
    if (this.player) {
      this.player.updateState({tile: player.tile})
    }
  }

  onOtherMoveTo(id, x, y) {
    if (this.players[id]) {
      var tile = this.movement.getTileAt(x,y)
      this.players[id].updateState({tile})
    }
  }

  initCamera(player) {
//    this.cameras.main.zoom = 2;
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

    this.input.on('pointerdown', _.throttle(pointer => {
      var tile = this.movement.getTileAtPointer(pointer)
      console.log("Tile", tile)
      if (tile) {
        this.socket.emit('moveTo', {x: tile.x, y: tile.y})
      }
      // Since the sprite click event happens after this event we need to do
      // something tricky. We could probably avoid it if we listened for events
      // on each tile in the tilemap instead (probably better).
      // We clear this timeout in the follow method below.
      this.notFollowTimeout = setTimeout(() => {
        this.player.notFollow()
      }, 50)
    }, 500), this);


    this.cursors = this.input.keyboard.createCursorKeys();
  }

  initEasystar() {
    this.easystar = new easystarjs.js();
    let map = this.map
    var mapData = []
    for (var x of map.layers[0].data) {
      let b = [];
      for (var y of x) {
        b.push(y.index)
      }
      mapData.push(b)
    }
    this.easystar.setGrid(mapData)
    let acceptableTiles = []
    for (var i=0;i<100;i++) { acceptableTiles.push(i) }
    acceptableTiles = acceptableTiles.filter( function( i ) {
      return !map.layers[0].collideIndexes.includes( i );
    } );
    this.easystar.setAcceptableTiles(acceptableTiles);
  }

  create()
  {

    console.log("MainScene");

    this.createMap();
    this.initEasystar();
    this.initPlayer();
    this.initDebug();
    this.initInput();


    // Set up the player to collide with the tilemap layer. Alternatively, you can manually run
    // collisions in update via: this.physics.world.collide(player, layer).

  }

  onTick(data) {
    for (var playerId in data.players) {
      var player = data.players[playerId]
      if (this.player && player.id == this.player.id) {
        this.player.updateState(player)
      } else {
        if (this.players[player.id]) {
          this.players[player.id].updateState(player)
        }
      }
    }
    for (var mobId in data.mobs) {
      var mob = data.mobs[mobId]
      if (this.mobs[mob.id]) {
        this.mobs[mob.id].updateState(mob)
      } else {
        var tile = this.movement.getTileAt(mob.tile.x, mob.tile.y)
        if (tile) {
          this.newMob(mob.id, tile)
        } else {
          console.warn("Mob spawned on an invalid tile", this.mobs[mob.id])
        }
      }
    }
  }

  onMobOrOtherPlayerClick(mobOrOtherPlayer) {
    this.player.follow(mobOrOtherPlayer)
    if (this.notFollowTimeout) {
      clearTimeout(this.notFollowTimeout)
      this.notFollowTimeout = null
    }
  }

  newMob(id, tile) {
    var mob = new Mob({id: id, scene: this, tile});
    mob.on('pointerdown', (pointer) => {
      this.onMobOrOtherPlayerClick(mob)
    });

    this.mobs[mob.id] = mob
  }

  update(time, delta) {

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
