class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture, frame) {
    texture = texture ? texture : 'player'
    frame = frame ? frame : 1
    super(scene, x, y, texture, frame)
    scene.physics.world.enable(this);
    scene.add.existing(this);
    this.body.offset = {x:this.body.halfWidth, y:this.body.halfHeight}
  }

  moveTo(toTile) {
    this.scene.movement.moveTo(this, toTile)
  }

}
export default Player;
