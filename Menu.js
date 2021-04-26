class MainMenu extends Phaser.Scene {
    constructor () {
        super('MainMenu');
    }
  
    preload() {
      loadImage(this, 'player', 'elementDiamond.png');
      loadImage(this, 'caravan', 'arrowSmall.png');
      this.load.image('backgroundPaper', 'assets/cartographypack/Textures/parchmentBasic.png')
    }
  
    create(data) {
      this.add.image(0, 0, 'backgroundPaper')
      this.add.text(10, 10, 'Deeper and deeper into the forest')
    }
  
    update(time, delta) {
        // Used to update your game. This function runs constantly
    }
    
  }
