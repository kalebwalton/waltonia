var Promise = require('bluebird'),
    globAsync = Promise.promisify(require("glob")),
    fs = Promise.promisifyAll(require("fs"));

export const REGISTER = "REGISTER"
export const register = (playername, password, email, socketId) => {
  return { type: REGISTER, playername, password, email, socketId }

}

export const AUTHENTICATE = "AUTHENTICATE"
export const authenticate = (playername, password, socketId) => {
  return { type: AUTHENTICATE, playername, password, socketId }
}

export const CLIENT_ERRORS_SENT = "CLIENT_ERRORS_SENT"
export const clientErrorsSent = (socketId) => {
  return { type: CLIENT_ERRORS_SENT, socketId }
}

export const DISCONNECT = "DISCONNECT"
export const disconnect = (socketId) => {
  return {type: DISCONNECT, socketId}
}

export const REQUEST_MOVE_TO_TARGET_TILE = "REQUEST_MOVE_TO_TARGET_TILE"
export const requestMoveToTargetTile = (x, y, socketId) => {
  return {type: REQUEST_MOVE_TO_TARGET_TILE, x, y, socketId}
}

export const MOVE_TO_TILE = "MOVE_TO_TILE"
export const moveToTile = (x, y, socketId) => {
  return {type: MOVE_TO_TILE, x, y, socketId}
}

export const GAME_START = "GAME_START"
export const gameStart = () => {
  return {type: GAME_START}
}

export const MAPS_LOAD = "MAPS_LOAD"
export const mapsLoad = (maps) => {
  return {type: MAPS_LOAD, maps}
}

export const TILESETS_LOAD = "TILESETS_LOAD"
export const tilesetsLoad = (tilesets) => {
  return {type: TILESETS_LOAD, tilesets}
}

export const mapsRequest = () => {
  return mapOrTileSetRequest(`${__dirname}/../../../public/assets/maps/defs/!(_)*.json`, mapsLoad)
}
export const tilesetsRequest = () => {
  return mapOrTileSetRequest(`${__dirname}/../../../public/assets/maps/tilesets/!(_)*.json`, tilesetsLoad)
}
export const mapOrTileSetRequest = (globPattern, loadFn) => {
  return (dispatch) => {
    return globAsync(globPattern).catch(function(err) {
          throw new Error("Error to read json files: " + err);
    }).map(function(file) {
        return fs.readFileAsync(file, 'utf8').then((data) => {
          var json = JSON.parse(data)
          json.id = file.substring(file.lastIndexOf('/')+1).split(".")[0]
          return json
        }, function(err) {
            throw new Error("Error to read config ("+file+")" + err);
        });
    }).then(
      maps => dispatch(loadFn(maps)),
      error => console.log(error)
    )
  }
}
