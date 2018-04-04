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

export const MOVE_TO = "MOVE_TO"
export const moveTo = (x, y, socketId) => {
  return {type: MOVE_TO, x, y, socketId}
}

export const GAME_START = "GAME_START"
export const gameStart = () => {
  return {type: GAME_START}
}

export const MAPS_LOAD = "MAPS_LOAD"
export const mapsRequest = () => {
  return (dispatch) => {
    return globAsync(`${__dirname}/../../../public/assets/maps/defs/{!(_*),(*.json)}`).catch(function(err) {
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
      maps => dispatch(mapsLoad(maps)),
      error => console.log(error)
    )
  }
}
export const mapsLoad = (maps) => {
  return {type: MAPS_LOAD, maps}
}

var Promise = require('bluebird'),
    globAsync = Promise.promisify(require("glob")),
    fs = Promise.promisifyAll(require("fs"));

export const fetchMaps = () => {

}
