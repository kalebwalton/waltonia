'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _Game = require('./lib/Game');

var _Game2 = _interopRequireDefault(_Game);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Setup basic express server
var app = (0, _express2.default)();
var server = _http2.default.createServer(app);
var io = (0, _socket2.default)(server);
var port = process.env.PORT || 3002;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Assets are copied into the 'dist' directory at build time and will be available for serving
app.use(_express2.default.static(_path2.default.join(__dirname, 'assets')));

var game = new _Game2.default({ io: io });