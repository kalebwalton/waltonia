import Player from './objects/Player'
import Mob from './objects/Mob'

import io from 'socket.io-client';
import _ from 'underscore';

class GameController {
  constructor(config) {
    this.url = new URL(window.location.href);
    this.socket = io(this.url.protocol+"//"+this.url.hostname+":3000");
    this.sceneManager = config.sceneManager

    this.player = null
    this.players = {}
    this.mobs = {}

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

  getMainScene() {
    // return this.scene
    return this.sceneManager.getAt(this.sceneManager.getIndex(this.sceneName))
  }

  doPlayerEnter(playerId) {
    this.socket.emit('enter', playerId)
    console.log("===PLAYER ENTER "+playerId+"===")
  }

  doPlayerMoveTo(tile) {
    this.socket.emit('moveTo', {x: tile.x, y: tile.y})
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

  onEnter(data) {
    // Loop until a scene exists and is ready
    var scene = this.getMainScene()
    if (!scene || !scene.movement) {
      setTimeout(() => { this.onEnter(data) }, 250)
      return
    }

    if (!this.player) {
      var tile = this.getMainScene().movement.getTileAt(data.player.tile.x, data.player.tile.y)
      this.player = new Player({id: data.player.id, scene: this.getMainScene(), tile});
    }
    this.getMainScene().cameras.main.startFollow(this.player, false);
    for (var id in data.players) {
      if (id != data.player.id) {
        this.onOtherEnter(data.players[id])
      }
    }
  }

  onOtherEnter(player) {
    if (!this.players[player.id]) {
      var tile = this.getMainScene().movement.getTileAt(player.tile.x, player.tile.y)
      this.players[player.id] = new Player({id: player.id, scene: this.getMainScene(), tile});
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
      var tile = this.getMainScene().movement.getTileAt(x,y)
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
        if (this.getMainScene()) {
          var tile = this.getMainScene().movement.getTileAt(mob.tile.x, mob.tile.y)
          if (tile) {
            this.newMob(mob.id, tile)
          } else {
            console.warn("Mob spawned on an invalid tile", this.mobs[mob.id])
          }
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
    var mob = new Mob({id: id, scene: this.getMainScene(), tile});
    mob.on('pointerdown', (pointer) => {
      this.onMobOrOtherPlayerClick(mob)
    });

    this.mobs[mob.id] = mob
  }

}
export default GameController
