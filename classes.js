class _point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
function Point(x, y) {
  return new _point(x, y);
}

class Log {
  constructor() {
    this._log = ( message, level, style ) => {
      console.log( `%c${level}%c - ${message}`, style, "" );
    };
    this.DEBUG = ( message ) => {
      this._log( message, "DEBUG", "color: blue" );
    };
    this.INFO = ( message ) => {
      this._log( message, "INFO", "" );
    };
    this.WARNING = ( message ) => {
      this._log( message, "WARNING", "color: yellow" );
    };
    this.ERROR = ( message ) => {
      this._log( message, "ERROR", "color: red; font-weight: bold" );
    };
  }
}


function loadImage(scene, key, imageName) {
  let cartographyPath = 'assets/cartographypack/PNG/Retina/'
  scene.load.image(key, cartographyPath + imageName)
}

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
    this.add.image(0,0,'backgroundPaper')
    this.add.text(10,10,'Deeper and deeper into the forest')
  }

  update(time, delta) {
      // Used to update your game. This function runs constantly
  }
  
}
