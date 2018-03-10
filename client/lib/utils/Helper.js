class Helper {

  constructor() {
    // cache of objects in map layers, cached by tilemap key
    this.layerObjectsCache = {}
  }

  _getLayerObjectCacheCoordsKey(tileX, tileY) {
    return `${tileX}_${tileY}`
  }

  getLayerObjectsAtTile(tilemap, tileX, tileY) {
    var key = tilemap.scene.key
    if (!this.layerObjectsCache[key]) {
      this.layerObjectsCache[key] = {}
      for (var objectLayer of tilemap.objects) {
        for (var object of objectLayer.objects) {
          var coordKey = this._getLayerObjectCacheCoordsKey(object.x/tilemap.tileWidth, (object.y-tilemap.tileHeight)/tilemap.tileHeight)
          if (!this.layerObjectsCache[key][coordKey]) {
            this.layerObjectsCache[key][coordKey] = []
          }
          // Need to remove a tileheight from Y because of how tiled places objects
          var layerObject = {
            objectLayerName: objectLayer.name,
            layerObject: object
          }
          this.layerObjectsCache[key][coordKey].push(layerObject)
        }
      }
    }
    return this.layerObjectsCache[key][this._getLayerObjectCacheCoordsKey(tileX, tileY)]
  }

}
export default Helper
