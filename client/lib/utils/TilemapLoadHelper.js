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
