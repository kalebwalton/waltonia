class Player {
  constructor(c) {
    this.id = c.id
    this.x = c.x
    this.y = c.y
    this.entered = c.entered
  }

  // Setters
  enter() {
    this.entered = true
  }

  exit() {
    this.entered = false
  }

  setXY(x, y) {
    this.x = x
    this.y = y
  }

  // Actions
  moveTo(x,y) {
    this.setXY(x,y)
  }

}
export default Player
