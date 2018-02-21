"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GameState = function () {
  function GameState() {
    _classCallCheck(this, GameState);

    this.players = {};
  }
  /*
  {
    one: {
      id: 'one',
      x: 5,
      y: 5
    },
    two: {
      id: 'two',
      x: 10,
      y: 10
    }
  };
  */


  _createClass(GameState, [{
    key: "getPlayer",
    value: function getPlayer(id) {
      if (this.players[id]) {
        return this.players[id];
      } else {
        this.players[id] = {
          id: id,
          connected: true,
          x: Math.floor(Math.random() * 10) + 1,
          y: Math.floor(Math.random() * 10) + 1
        };
        return this.players[id];
      }
    }
  }, {
    key: "setPlayerConnected",
    value: function setPlayerConnected(id) {
      if (this.players[id]) {
        this.players[id].connected = true;
      }
    }
  }, {
    key: "setPlayerDisconnected",
    value: function setPlayerDisconnected(id) {
      if (this.players[id]) {
        this.players[id].connected = false;
      }
    }
  }, {
    key: "setPlayerXY",
    value: function setPlayerXY(id, x, y) {
      if (this.players[id]) {
        this.players[id].x = x;
        this.players[id].y = y;
      }
    }
  }, {
    key: "getConnectedPlayers",
    value: function getConnectedPlayers() {
      var ret = {};
      for (var id in this.players) {
        if (this.players[id].connected) {
          ret[id] = this.players[id];
        }
      }
      return ret;
    }
  }]);

  return GameState;
}();

exports.default = GameState;