import Player from '../objects/Player'
import Mob from '../objects/Mob'
import Movement from '../utils/Movement'
import _ from 'underscore';
import easystarjs from 'easystarjs';


class MainScene extends Phaser.Scene {
  constructor(config) {
    var {map} = config
    var key = map.name+"_"+map.type+"_"+map.level
    super({key})
    this.key = key
    this.easystar = null
    this.mapConfig = map
    this.controller = config.controller
  }

  getKey() {
    return this.key
  }

  preload()
  {
    console.log("===MAIN SCENE PRELOAD===")
    this.movement = new Movement(this)
    this.url = new URL(window.location.href);
    this.load.tilemapTiledJSON(this.getKey(), `assets/maps/defs/${this.mapConfig.name}_${this.mapConfig.type}_${this.mapConfig.level}.json`);
    this.load.image('map', `assets/maps/tiles/combined/${this.mapConfig.name}_${this.mapConfig.type}.png`);
    this.load.spritesheet('player', 'assets/sprites/players/female_warrior.png', { frameWidth: 20, frameHeight: 20 });
    this.load.spritesheet('mob', 'assets/sprites/mobs/little_flare.png', { frameWidth: 20, frameHeight: 20 });
    this.load.spritesheet('highlight', 'assets/sprites/highlight.png', { frameWidth: 20, frameHeight: 20 });

  }

  initMap() {
    this.map = this.make.tilemap({ key: this.getKey(), tileWidth: 20, tileHeight: 20 });
    console.log(this.map)
    var tileset = this.map.addTilesetImage('map');
    var layer = this.map.createStaticLayer('map', tileset);
    //
    // //  This isn't totally accurate, but it'll do for now
    // var tileData = this.map.tilesets[0].tileData;
    // var collideIndexes = []
    // for (var i in tileData) {
    //   switch (tileData[i].type) {
    //     case 'block':
    //     case 'sign':
    //     case 'stone':
    //     case 'tombstone':
    //     case 'tree':
    //     case 'well':
    //       collideIndexes.push(i)
    //       break
    //
    //     case 'door':
    //     case 'grass':
    //     case 'gravel':
    //     case 'path':
    //     case 'sand':
    //     case 'stair':
    //     default:
    //       break
    //   }
    // }
    // this.map.setCollision(collideIndexes, true, true, layer)
  }

  initPlayer() {
    var playerId = this.url.searchParams.get("id");
    this.controller.doPlayerEnter(playerId)
  }

  initCamera(player) {
//    this.cameras.main.zoom = 2;
    this.cameras.main.startFollow(player, false);
  }

  initInput() {
    this.input.on('pointerdown', _.throttle(pointer => {
      var tile = this.movement.getTileAtPointer(pointer)
      console.log("Tile", tile)
      if (tile) {
        this.controller.doPlayerMoveTo(tile)
      }
      // Since the sprite click event happens after this event we need to do
      // something tricky. We could probably avoid it if we listened for events
      // on each tile in the tilemap instead (probably better).
      // We clear this timeout in the follow method below.
      this.notFollowTimeout = setTimeout(() => {
        this.controller.player.notFollow()
      }, 50)
    }, 500), this);
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
    for (var i=0;i<1000;i++) { acceptableTiles.push(i) }
    acceptableTiles = acceptableTiles.filter( function( i ) {
      return !map.layers[0].collideIndexes.includes( i );
    } );
    this.easystar.setAcceptableTiles(acceptableTiles);
  }

  create()
  {

    console.log("===CREATE MAIN SCENE===");

    this.initMap();
    this.initEasystar();
    this.initPlayer();
    this.initInput();

    // Set up the player to collide with the tilemap layer. Alternatively, you can manually run
    // collisions in update via: this.physics.world.collide(player, layer).

  }

  update(time, delta) {

  }

  destroy() {
    // if (this.player) this.player.destroy()
    // if (this.players) {
    //   for (var id in this.players) {
    //     this.players[id].destroy()
    //     delete this.players[id]
    //   }
    // }
    // if (this.mobs) {
    //   for (var id in this.mobs) {
    //     this.mobs[id].destroy()
    //     delete this.mobs[id]
    //   }
    // }
    this.sys.destroy()
    console.log("DESTROYED")
  }

}

export default MainScene
