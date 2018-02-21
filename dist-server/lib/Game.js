'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _GameState = require('./GameState');

var _GameState2 = _interopRequireDefault(_GameState);

var _GameIO = require('./GameIO');

var _GameIO2 = _interopRequireDefault(_GameIO);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Game = function Game(config) {
  _classCallCheck(this, Game);

  this.state = new _GameState2.default();
  this.io = new _GameIO2.default({ io: config.io, state: this.state });
};

exports.default = Game;