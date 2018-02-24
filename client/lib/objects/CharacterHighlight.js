class CharacterHighlight extends Phaser.GameObjects.Sprite {
  constructor({scene, x, y}) {
    var texture = 'highlight'
    var frame = 0
    super(scene, x, y, texture, frame)
    scene.physics.world.enable(this)
    this.setOrigin(0,0)
    scene.add.existing(this)
    this.setVisible(false)
  }
}
export default CharacterHighlight;
