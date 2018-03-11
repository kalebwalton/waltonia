import Player from './objects/Player'
import Mob from './objects/Mob'
import MapScene from './MapScene';

import io from 'socket.io-client';
import _ from 'underscore';

class Controller {
  constructor(config) {
    this.url = new URL(window.location.href);
    this.socket = io(this.url.protocol+"//"+this.url.hostname+":3000");
    this.sceneManager = config.sceneManager
    this.game = config.game

    this.player = null
    this.players = {}
    this.mobs = {}

    this.initSocketEvents()

  }

  initSocketEvents() {
    var socket = this.socket
    socket.on('moveTo', (player) => {
      console.debug("moveTo: ", player)
      this.onMoveTo(player)
    })
    socket.on('exit', () => {
      console.debug("exit")
      this.onExit()
    })
    socket.on('otherExit', (data) => {
      console.debug("otherExit: ", data)
      this.onOtherExit(data)
    })
    socket.on('enter', (data) => {
      console.debug("enter: ", data)
      this.onEnter(data)
    })
    socket.on('otherEnter', (data) => {
      console.debug("otherEnter: ", data)
      this.onOtherEnter(data.player)
    })
    socket.on('tick', (data) => {
      console.debug("tick: ", data)
      this.onTick(data)
    })

  }

  getMapScene() {
    return this.sceneManager.getAt(this.sceneManager.getIndex(this.sceneName))
  }

  changeLevel(name, type, level) {
    // capture details about the player so we can recreate him
    // FIXME figure out a better way to do this
    var playerId, playerTile, playerTileX, playerTileY
    if (this.player) {
      playerId = this.player.id
      playerTile = this.getMapScene().movement.getTileAtObject(this.player)
      playerTileX = playerTile.x
      playerTileY = playerTile.y

      this.player.destroy()
      delete this.player
    }
    if (this.players) {
      for (var id in this.players) {
        this.players[id].destroy()
        delete this.players[id]
      }
    }
    if (this.mobs) {
      for (var id in this.mobs) {
        this.mobs[id].destroy()
        delete this.mobs[id]
      }
    }
    if (this.getMapScene()) {
      this.sceneManager.stop(this.sceneName)
    }

    // create or activate the target scene
    let mapScene = new MapScene({map: {name, type, level}, controller: this})
    if (this.sceneManager.getScene(mapScene.getKey())) {
      this.sceneManager.stop(this.sceneName)
      this.sceneManager.start(mapScene.getKey())
    } else {
      this.sceneManager.add(mapScene.getKey(), mapScene, true)
    }
    this.sceneName = mapScene.getKey()

    // add any existing players
    mapScene.on('create', () => {
      if (playerId) {
        var tile = mapScene.movement.getTileAt(playerTileX, playerTileY)
        this.createPlayer(mapScene, playerId, tile)
      }
    })

  }




  // CHARACTER CREATION

  createPlayer(scene, id, tile) {
    var player = new Player({id, scene, tile});
    player.on('moveStart', this.onCharacterMoveStart.bind(this))
    player.on('moveComplete', this.onCharacterMoveComplete.bind(this))
    player.on('moveComplete', this.onPlayerMoveComplete.bind(this))
    return player
  }

  createOtherPlayer(scene, id, tile) {
    var otherPlayer = new Player({id, scene, tile});
    otherPlayer.on('moveStart', this.onCharacterMoveStart.bind(this))
    otherPlayer.on('moveComplete', this.onCharacterMoveComplete.bind(this))
    otherPlayer.on('pointerdown', (pointer) => {
      this.onCharacterClick(otherPlayer)
    });
    return otherPlayer
  }

  createMob(id, tile) {
    var mob = new Mob({id: id, scene: this.getMapScene(), tile});
    mob.on('moveStart', this.onCharacterMoveStart.bind(this))
    mob.on('moveComplete', this.onCharacterMoveComplete.bind(this))
    mob.on('pointerdown', (pointer) => {
      this.onCharacterClick(mob)
    });
    return mob
  }




  // SOCKET EVENT HANDLING

  onEnter(data) {
    // Loop until a scene exists and is ready
    var scene = this.getMapScene()
    if (!scene || !scene.movement) {
      setTimeout(() => { this.onEnter(data) }, 250)
      return
    }

    if (!this.player) {
      var tile = this.getMapScene().movement.getTileAt(data.player.tile.x, data.player.tile.y)
      this.player = this.createPlayer(this.getMapScene(), data.player.id, tile)
    }
    this.getMapScene().cameras.main.startFollow(this.player, true);
    for (var id in data.players) {
      if (id != this.player.id) {
        this.onOtherEnter(data.players[id])
      }
    }
  }

  onOtherEnter(player) {
    if (!this.players[player.id]) {
      var tile = this.getMapScene().movement.getTileAt(player.tile.x, player.tile.y)
      this.players[player.id] = this.createOtherPlayer(this.getMapScene(), player.id, tile);
    }
  }

  onMoveTo(player) {
    if (this.player) {
      this.player.updateState({tile: player.tile})
    }
  }

  onOtherMoveTo(id, x, y) {
    if (this.players[id]) {
      var tile = this.getMapScene().movement.getTileAt(x,y)
      this.players[id].updateState({tile})
    }
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
        if (this.getMapScene()) {
          var tile = this.getMapScene().movement.getTileAt(mob.tile.x, mob.tile.y)
          if (tile) {
            this.mobs[mob.id] = this.createMob(mob.id, tile)
          } else {
            console.warn("Mob spawned on an invalid tile", this.mobs[mob.id])
          }
        }
      }
    }
  }

  onDisconnect() {
    if (this.player) {
      this.player.destroy()
    }
  }

  onOtherExit(player) {
    if (this.players[player.id]) {
      console.debug("Destroying ", this.players[player.id])
      this.players[player.id].destroy()
      delete this.players[player.id]
    }
  }



  // PLAYER SOCKET EVENT EMITTERS

  doPlayerEnter(playerId) {
    this.socket.emit('enter', playerId)
    console.log("===PLAYER ENTER "+playerId+"===")
  }

  doPlayerMoveTo(tile) {
    this.socket.emit('moveTo', {x: tile.x, y: tile.y})
  }




  // CHARACTER EVENT HANDLING

  handlePlayerTileActions(toTile) {
    var layerObjects = this.game.helper.getLayerObjectsAtTile(this.getMapScene().map, toTile.x, toTile.y)
    if (layerObjects) {
      for (var lo of layerObjects) {
        switch(lo.objectLayerName) {
          case 'portals':
            var parts = lo.layerObject.name.split("_")
            this.changeLevel(parts[0], parts[1], parts[2])
          default:
            break
        }
      }
    }
  }

  onCharacterMoveStart(character, fromTile) {
    this.getMapScene().easystar.stopAvoidingAdditionalPoint(fromTile.x, fromTile.y)
  }

  onCharacterMoveComplete(character, toTile) {
    this.getMapScene().easystar.avoidAdditionalPoint(toTile.x, toTile.y)
  }

  onPlayerMoveComplete(player, toTile) {
    this.handlePlayerTileActions(toTile)
  }

  onCharacterClick(character) {
    if (character != this.player) {
      this.player.follow(character)
      if (this.getMapScene().notFollowTimeout) {
        clearTimeout(this.getMapScene().notFollowTimeout)
        this.getMapScene().notFollowTimeout = null
      }
    }
  }


}
export default Controller
