import express from 'express';
import path from 'path';
import http from 'http';
import io_server from 'socket.io';
import Game from './lib/Game';

// Setup basic express server
var app = express();
var server = http.createServer(app);
var io = io_server(server);
var port = process.env.PORT || 3002;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Assets are copied into the 'dist' directory at build time and will be available for serving
app.use(express.static(path.join(__dirname, 'assets')));

var game = new Game({io: io})
