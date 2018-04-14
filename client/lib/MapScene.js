import Character from './objects/Character'
import Player from './objects/Player'
import Mob from './objects/Mob'
import Movement from './utils/Movement'
import _ from 'underscore';
import easystarjs from 'easystarjs';
import EventEmitter from 'eventemitter3';

class MapScene extends Phaser.Scene {
  constructor(config) {
    var {map} = config
    var key = map.name+"_"+map.type+"_"+map.level
    super({key})
    this.key = key
    this.easystar = null
    this.mapConfig = map
    this.controller = config.controller
    this.events = new EventEmitter()
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
    this.movement = new Movement(this)
    this.url = new URL(window.location.href);


    var customTilemapJSONFile = (key, url, path, format, xhrSettings) => {
      var json = new Phaser.Loader.FileTypes.JSONFile(key, url, path, xhrSettings);
      json.type = 'tilemapJSON';
      json.tilemapFormat = format;
      var onProcess = function(callback) {
        this.state = Phaser.Loader.FILE_PROCESSING;
        this.data = JSON.parse(this.xhrLoader.responseText);

        // Need to pass the URL through so we can create a relative path to any external
        // source files like tilesets.
        this.data.url = url

        for (let i=0;i<this.data.tilesets.length;i++) {
          let tileset = this.data.tilesets[i]

          // Remove tileset.source so tilemap parser doesn't bomb out
          tileset.sourceBackup = tileset.source
          delete tileset.source

          // // Add another file to the loader before all files are loaded
          // loader.addFile(customTilesetJSONFile(key+"_tileset_"+i, tilemapURI.pathname, path, format, xhrSettings))

        }
        this.onComplete();
        callback(this);
      }
      json.onProcess = onProcess.bind(json)

      return json;
    }

    Phaser.Loader.FileTypesManager.register('customTilemapJSONFile', function (key, url, xhrSettings) {
        if (Array.isArray(key)) {
            for (var i = 0; i < key.length; i++) {
                //  If it's an array it has to be an array of Objects, so we get everything out of the 'key' object
                this.addFile(customTilemapJSONFile(key[i], url, this.path, Phaser.Tilemaps.Formats.TILED_JSON, xhrSettings));
            }
        } else {
            this.addFile(customTilemapJSONFile(key, url, this.path, Phaser.Tilemaps.Formats.TILED_JSON, xhrSettings));
        }

        return this;
    });
    Phaser.Loader.FileTypesManager.install(this.load)

    this.load.customTilemapJSONFile(this.getKey(), `assets/maps/defs/${this.mapConfig.name}_${this.mapConfig.type}_${this.mapConfig.level}.json`);
    this.load.image(this.mapConfig.type, `assets/maps/tiles/combined/${this.mapConfig.name}_${this.mapConfig.type}.png`);
    this.load.spritesheet('player', 'assets/sprites/players/female_warrior.png', { frameWidth: 20, frameHeight: 20 });
    this.load.spritesheet('mob', 'assets/sprites/mobs/little_flare.png', { frameWidth: 20, frameHeight: 20 });
    this.load.spritesheet('highlight', 'assets/sprites/highlight.png', { frameWidth: 20, frameHeight: 20 });

  }

  create()
  {
    this.load.removeAllListeners()
    this.load.once('complete', this.myInit, this);

    var customTilesetJSONFile = (tilemapKey, key, url, path, format, xhrSettings) => {
      var json = new Phaser.Loader.FileTypes.JSONFile(key, url, path, xhrSettings);

      var onProcess = function(callback) {
        this.state = Phaser.Loader.FILE_PROCESSING;
        this.data = JSON.parse(this.xhrLoader.responseText);
        this.data.tilemapKey = tilemapKey
        this.onComplete();
        callback(this);
      }
      var onComplete = function () {
          if (this.linkFile) {
              if (this.linkFile.state === Phaser.Loader.FILE_WAITING_LINKFILE) {
                  //  The linkfile has finished processing, and is waiting for this file, so let's do them both
                  this.state = Phaser.Loader.FILE_COMPLETE;
                  this.linkFile.state = Phaser.Loader.FILE_COMPLETE;
                  this.loader.emit('filecomplete', this)
              } else {
                  //  The linkfile still hasn't finished loading and/or processing yet
                  this.state = Phaser.Loader.FILE_WAITING_LINKFILE;
              }
          } else {
              this.state = Phaser.Loader.FILE_COMPLETE;
              this.loader.emit('filecomplete', this)
          }
      }
      json.onProcess = onProcess.bind(json)
      json.onComplete = onComplete.bind(json)

      return json;
    }

    Phaser.Loader.FileTypesManager.register('customTilesetJSONFile', function (tilemapKey, key, url, xhrSettings) {
        if (Array.isArray(key)) {
            for (var i = 0; i < key.length; i++) {
                //  If it's an array it has to be an array of Objects, so we get everything out of the 'key' object
                this.addFile(customTilesetJSONFile(tilemapKey, key[i], url, this.path, Phaser.Tilemaps.Formats.TILED_JSON, xhrSettings, this));
            }
        } else {
            this.addFile(customTilesetJSONFile(tilemapKey, key, url, this.path, Phaser.Tilemaps.Formats.TILED_JSON, xhrSettings, this));
        }
        return this;
    });
    Phaser.Loader.FileTypesManager.install(this.load)

    var tm = this.cache.tilemap.get(this.getKey()).data
    var tss = tm.tilesets
    for (let i=0;i<tss.length;i++) {
      let ts = tss[i]
      let loc = new URL(window.location.href)
      let tilemapURI = new URL(tm.url.substr(0,tm.url.lastIndexOf("/")+1)+ts.sourceBackup, loc)
      this.load.customTilesetJSONFile(this.getKey(), this.getKey()+"_ts_"+i, tilemapURI.pathname)
    }

    this.load.on('filecomplete', (file) => {
      // Just check the data for a key of 'tilemapKey' which indicates it's a tileset
      if (file.data.tilemapKey) {
        var ts = file.data
        ts.firstgid = 1
        // Merge into the associated tilemap
        var tm = this.cache.tilemap.get(ts.tilemapKey).data
        tm.tilesets[0] = ts
        console.log(tm)
      }
    })

    this.load.start()
  }

  myInit() {
    this.initMap();
    this.initEasystar();
    this.initPlayer();
    this.initInput();
    this.events.emit("create")
  }

  initMap() {

    this.map = this.make.tilemap({ key: this.getKey(), tileWidth: 20, tileHeight: 20 });
    console.log(this.map)
    var tileset = this.map.addTilesetImage(this.mapConfig.type);
    var layer = this.map.createStaticLayer('map', tileset);

    //  This isn't totally accurate, but it'll do for now
    var tileData = this.map.tilesets[0].tileData;
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
    this.map.setCollision(collideIndexes, true, true, layer)
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

  initEasystar() {
    this.easystar = new easystarjs.js();
    let map = this.map
    var mapData = []
    for (var rows of map.layers[0].data) {
      let b = [];
      for (var tile of rows) {
        b.push(tile.index)
        var tileData = map.tilesets[0].getTileData(tile.index)
        if (tileData && map.tilesets[0].getTileData(tile.index).type == 'door') {
          // give the door and the tile above the door some special directional rules
          // so you can't enter doors from the top or exit them to the top
          this.easystar.setDirectionalCondition(tile.x, tile.y, [easystarjs.BOTTOM]);
          this.easystar.setDirectionalCondition(tile.x, tile.y-1, [easystarjs.TOP, easystarjs.LEFT, easystarjs.RIGHT]);
        }
      }
      mapData.push(b)
    }
    this.easystar.setGrid(mapData)
    let acceptableTiles = []
    for (var i=0;i<10000;i++) { acceptableTiles.push(i) }
    acceptableTiles = acceptableTiles.filter( function( i ) {
      // For some reason we are offset by index 1 when we get the tile index. Compensating here.
      return !map.layers[0].collideIndexes.includes( ""+(i-1) );
    } );
    this.easystar.setAcceptableTiles(acceptableTiles);
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
