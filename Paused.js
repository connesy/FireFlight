class Paused extends Phaser.Scene {
  constructor () {
      super('Paused');
  }
  create(data) {
    this.pausedText = this.add.text(500, 500, "Game paused ...")
    this.input.keyboard.once('keyup-P', () => {
      this.scene.launch(data.currentLevel)
    });
  }

  update(time, delta) {
      // Used to update your game. This function runs constantly
  }
  
}
