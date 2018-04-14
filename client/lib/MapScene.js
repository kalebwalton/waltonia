import './utils/TilemapLoadHelper'
import Character from './objects/Character'
import Player from './objects/Player'
import Mob from './objects/Mob'
import Movement from './utils/Movement'
import _ from 'underscore'
import EventEmitter from 'eventemitter3'

class MapScene extends Phaser.Scene {
  constructor(config) {
    var {map} = config
    var key = map.name+"_"+map.type+"_"+map.level
    super({key})
    this.key = key
    this.mapConfig = map
    this.controller = config.controller
    this.events = new EventEmitter()
    this.movement = new Movement(this)
    this.url = new URL(window.location.href);

  }

  on(eventName, callback) {
    this.events.on(eventName, callback)
  }

  getKey() {
    return this.key
  }

  preload()
  {
    console.log("===MAIN SCENE PRELOAD===")

    // The TilemapLoadHelper depends on this
    Phaser.Loader.FileTypesManager.install(this.load)

    this.load.customTilemapJSONFile(this.getKey(), `assets/maps/defs/${this.mapConfig.name}_${this.mapConfig.type}_${this.mapConfig.level}.json`);

    this.load.spritesheet('player', 'assets/sprites/players/female_warrior.png', { frameWidth: 20, frameHeight: 20 });
    this.load.spritesheet('mob', 'assets/sprites/mobs/little_flare.png', { frameWidth: 20, frameHeight: 20 });
    this.load.spritesheet('highlight', 'assets/sprites/highlight.png', { frameWidth: 20, frameHeight: 20 });

  }

  create()
  {
    var tm = this.cache.tilemap.get(this.getKey()).data
    var tss = tm.tilesets
    for (let i=0;i<tss.length;i++) {
      let ts = tss[i]
      let loc = new URL(window.location.href)
      let tilesetURI = new URL(tm.url.substr(0,tm.url.lastIndexOf("/")+1)+ts.sourceBackup, loc)
      this.load.customTilesetJSONFile(this.getKey(), this.getKey()+"_ts_"+i, tilesetURI.pathname)
    }

    this.load.removeAllListeners()

    this.load.on('filecomplete', (file) => {
      // Just check the data for a key of 'tilemapKey' which indicates it's a tileset
      if (file.data.tilemapKey) {
        var ts = file.data
        ts.firstgid = 1
        // Merge into the associated tilemap
        var tm = this.cache.tilemap.get(ts.tilemapKey).data
        tm.tilesets[0] = ts
      }
    })

    this.load.once('complete', this.initTilesetImage, this);
    this.load.start()
  }

  initTilesetImage() {
    let tm = this.cache.tilemap.get(this.getKey()).data
    let ts = tm.tilesets[0]
    let loc = new URL(window.location.href)
    let imageURL = ts.image
    let tilesetImageURI = new URL(tm.url.substr(0,tm.url.lastIndexOf("/")+1)+imageURL, loc)
    this.load.image(ts.name, tilesetImageURI.pathname);

    this.load.removeAllListeners()
    this.load.once('complete', this.initFinal, this);
    this.load.start()
  }

  initFinal() {
    this.initMap();
    this.initPlayer();
    this.initInput();
    this.events.emit("create")
  }

  initMap() {
    this.map = this.make.tilemap({ key: this.getKey(), tileWidth: 20, tileHeight: 20 });
    this.map.addTilesetImage(this.mapConfig.type);
    this.map.createStaticLayer('map', tileset);
  }

  initPlayer() {
    var playername = this.url.searchParams.get("name");
    var playerpass = this.url.searchParams.get("password")
    this.controller.doAuthenticate(playername, playerpass)
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

  isCharacterAtTile(tile, ignoreCharacter) {
    for (var obj of this.children.getAll()) {
      if (obj != ignoreCharacter && obj instanceof Character && obj.tile == tile) {
        console.log("Character at tile", tile)
        return true
      }
    }
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

export default MapScene
