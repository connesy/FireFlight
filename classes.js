function Point(x, y) {
  const Point = {};
  Point.x = x;
  Point.y = y;
  return Point;
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
