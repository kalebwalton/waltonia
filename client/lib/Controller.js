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
    console.log("Setting up socket")
    var socket = this.socket
    // socket.on('moveTo', (player) => {
    //   console.debug("moveTo: ", player)
    //   this.onMoveTo(player)
    // })
    // socket.on('exit', () => {
    //   console.debug("exit")
    //   this.onExit()
    // })
    // socket.on('otherExit', (data) => {
    //   console.debug("otherExit: ", data)
    //   this.onOtherExit(data)
    // })
    // socket.on('enter', (data) => {
    //   console.debug("enter: ", data)
    //   this.onEnter(data)
    // })
    // socket.on('otherEnter', (data) => {
    //   console.debug("otherEnter: ", data)
    //   this.onOtherEnter(data.player)
    // })
    socket.on('tick', (state) => {
      this.onTick(state)
    })

    socket.on('error', (data) => {
      this.onError(data)
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
        this.player = this.createFirstPlayer(mapScene, playerId, tile)
      }
    })

  }




  // CHARACTER CREATION

  createPlayer(scene, id, name, tile, cameraFollow) {
    console.log("Creating player", id, name, tile, cameraFollow)
    var player = new Player({id, name, scene, tile, cameraFollow});
    return player
  }

  createFirstPlayer(scene, id, name, tile, cameraFollow) {
    var player = this.createPlayer(scene, id, name, tile, true)
    player.on('moveComplete', this.onFirstPlayerMoveComplete.bind(this))
    return player
  }

  createOtherPlayer(scene, id, name, tile) {
    var player = this.createPlayer(scene, id, name, tile, false)
    player.on('pointerdown', (pointer) => {
      this.onCharacterClick(player)
    });
    return player
  }

  createMob(id, tile) {
    var mob = new Mob({id: id, scene: this.getMapScene(), tile});
    mob.on('pointerdown', (pointer) => {
      this.onCharacterClick(mob)
    });
    return mob
  }

  // SOCKET EVENT HANDLING

  onTick(state) {
    var scene = this.getMapScene()
    if (scene && scene.movement) {
      if (state.player) {
        // Handle new player creation
        if (!this.player) {
          var tile = this.getMapScene().movement.getTileAt(state.player.tile.x, state.player.tile.y)
          this.player = this.createFirstPlayer(this.getMapScene(), state.player.id, state.player.name, tile)
          this.getMapScene();
        }

        console.log("Tick Player", state.player.tile)

        this.player.updateState({targetTile: state.player.tile})
      }

      if (state.players) {
        for (var id in state.players) {
          var player = state.players[id]
          if ((this.player && id != this.player.id) && !this.players[id]) {
            var tile = this.getMapScene().movement.getTileAt(player.tile.x, player.tile.y)
            this.players[id] = this.createOtherPlayer(this.getMapScene(), player.id, player.name, tile);
          }
          if (this.players[id]) {
            console.log("Tick Player 2", player.tile)
            this.players[id].updateState({targetTile: player.tile})
          }
        }
      }

      // for (var mobId in data.mobs) {
      //   var mob = data.mobs[mobId]
      //   if (this.mobs[mob.id]) {
      //     this.mobs[mob.id].updateState(mob)
      //   } else {
      //     if (this.getMapScene()) {
      //       var tile = this.getMapScene().movement.getTileAt(mob.tile.x, mob.tile.y)
      //       if (tile) {
      //         this.mobs[mob.id] = this.createMob(mob.id, tile)
      //       } else {
      //         console.warn("Mob spawned on an invalid tile", this.mobs[mob.id])
      //       }
      //     }
      //   }
      // }

    }
  }

  //
  // onOtherMoveTo(id, x, y) {
  //   if (this.players[id]) {
  //     var tile = this.getMapScene().movement.getTileAt(x,y)
  //     this.players[id].updateState({tile})
  //   }
  // }


  onDisconnect() {
    if (this.player) {
      this.player.destroy()
    }
  }

  // FIXME handle exit
  //
  // onOtherExit(player) {
  //   if (this.players[player.id]) {
  //     console.debug("Destroying ", this.players[player.id])
  //     this.players[player.id].destroy()
  //     delete this.players[player.id]
  //   }
  // }



  // PLAYER SOCKET EVENT EMITTERS

  doAuthenticate(playername, password) {
    this.socket.emit('authenticate', {playername, password})
    console.log("===PLAYER ENTER "+playername+"===")
  }

  doPlayerMoveTo(tile) {
    this.socket.emit('requestMoveToTargetTile', {x: tile.x, y: tile.y})
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

  onFirstPlayerMoveComplete(player, toTile) {
    //this.handlePlayerTileActions(toTile)
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
