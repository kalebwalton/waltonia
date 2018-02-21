class Player extends Phaser.GameObjects.Sprite {
  constructor(id, scene, x, y, texture, frame) {
    texture = texture ? texture : 'player'
    frame = frame ? frame : 1
    super(scene, x, y, texture, frame)
    scene.physics.world.enable(this);
    this.body.offset = {x:8, y:8}
    scene.add.existing(this);
    this.id = id
  }

  moveTo(toTile) {
    this.scene.movement.moveTo(this, toTile)
  }

}
export default Player;
