import easystarjs from 'easystarjs';

export default class Pathfinder {
  constructor(grid, acceptableTileGids, doors) {
    this.easystar = new easystarjs.js();
    this.easystar.setGrid(grid)
    this.easystar.setAcceptableTiles(acceptableTileGids)
    for (var y of grid) {
      var x = grid[y]
      if (doors[x]) {
        this.easystar.setDirectionalCondition(x,y,[easystarjs.BOTTOM])
        this.easystar.setDirectionalCondition(x,y-1,[easystarjs.TOP, easystarjs.LEFT, easystarjs.RIGHT])
      }
    }
  }

  calculate(fromX, fromY, toX, toY, callback) {
    this.easystar.findPath(fromX, fromY, toX, toY, callback);
    this.easystar.calculate();
  }
}
