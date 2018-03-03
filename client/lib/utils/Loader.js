class Loader {
  // A map consists of:
  // - The 'map' data with layers at metadata about tiles, tilesets, spawns, etc
  // - The tileset
  map(name, callback) {
    var url = `/assets/maps/defs/${name}.json`
    fetch(url, { method: 'get' }).then(response => {

    }).catch(err => {
      console.error(`Map '${name}' not found at ${url}`)
    });
  }
}
export default Loader
