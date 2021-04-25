// Define default colors
// let clrBackground = "0x003f3f";
// let clrPlayer = "0xff0000";
// let clrFoW = "0x333333";
// let clrCaravan = "0x339933";

let clrBackground = "0x81855e";
let clrPlayer = "0xff0000";
// let clrFoW = '#D9CFA3';
let clrFoW = '#fff6c7';
let clrCaravan = '0x0f0f0f';
let clrWoD = '0x663000';

const canvasWidth = 1200;
const canvasHeight = 800;
const gameState = {};
const gameWidth = 10000;
const gameHeight = canvasHeight;
const speedX = 150;
const speedY = 150;

// Set various game-related properties
gameState.wallSpeed = 0.5;

const config = {
  type: Phaser.WEBGL,
  width: canvasWidth,
  height: canvasHeight,
  backgroundColor: clrBackground,
  physics: {
    default: 'arcade',
    arcade: {
        gravity: { x: 0, y: 0 },
        // debug: true
    }
  },
  scene: {
    preload,
    create,
    update
  }
}

function loadImage(scene, key, imageName) {
  let cartographyPath = 'assets/cartographypack/PNG/Retina/'
  scene.load.image(key, cartographyPath + imageName)
}

function preload (){
  loadImage(this, 'treePine', 'treePine.png')
  loadImage(this, 'flag', 'flag.png')
  loadImage(this, 'bush', 'bush.png')
  loadImage(this, 'player', 'elementDiamond.png');
  loadImage(this, 'caravan', 'arrowSmall.png');
  this.load.image('backgroundPaper', 'assets/cartographypack/Textures/parchmentBasic.png')
  this.load.image('testMap', 'assets/testMap.png')
}

function create() {
  gameState.currentScene = this
  gameState.frameCount = 0;
  gameState.cursorKeys = this.input.keyboard.createCursorKeys();
  
  this.cameras.main.setBounds(0, 0, gameWidth, gameHeight);
  this.cameras.main.setZoom(1);
  
  let firstBackGround = this.add.image(0, 0, 'backgroundPaper').setOrigin(0);
  const bgH = firstBackGround.height;
  const bgW = firstBackGround.width;
  const numHori = Math.ceil(gameWidth / bgW);
  const numVert = Math.ceil(gameHeight / bgH);
  for (let i = 0; i < numHori; i++) {
    for (let j = 0; j < numVert; j++) {
      this.add.image(i*bgH, j*bgW, 'backgroundPaper').setOrigin(0);
    }
  }
  
  let treeGroup = this.physics.add.staticGroup();
  let mapWidth = 300;
  let mapHeight = 80;
  let curPixelVal
  for (let i = 0; i < mapWidth; i++) {
    for (let j = 0; j < mapHeight; j++) { 
      curPixelVal = this.textures.getPixel(i,j,'testMap');
      
      if (curPixelVal.g < 255) {
        if (curPixelVal.g == 0) {
        treeGroup.create(i*10, j*10, 'treePine').setScale(0.3).refreshBody().setSize(15,25);        
        } else {
          if (255*Math.random() > curPixelVal.g){
            treeGroup.create(i*10, j*10, 'treePine').setScale(0.3).refreshBody().setSize(15,25);        
          }
        }
      }
    }
  }

  gameState.player = this.physics.add.sprite(400, 400, 'player').setScale(0.2);
  gameState.player.setBounce(1);
  // gameState.player.setCollideWorldBounds(true)
  gameState.player.setInteractive();
  gameState.player.visionRadius = 80;
  
  // Add collision between player and all trees
  this.physics.add.collider(gameState.player, treeGroup)
  
  // Fog of War
  gameState.fowCanvas = this.textures.createCanvas('fow', gameWidth, gameHeight);
  const context = gameState.fowCanvas.context;
  context.fillStyle = clrFoW;  
  context.fillRect(0,0,gameWidth,gameHeight);
  
  gameState.fowCanvas.refresh(); 
  gameState.fowCanvas.context.globalCompositeOperation = 'destination-out';
  
  drawVisionPlayer(gameState);
  this.add.image(0, 0, 'fow').setOrigin(0);
    
  // Caravan 
  gameState.caravan = this.physics.add.sprite(200, gameHeight/2, 'caravan').setSize(50, 50)
  gameState.caravan.moveSpeed = 100;
  gameState.caravan.visionRadius = 100;
  gameState.caravan.setInteractive();
  this.physics.add.collider(gameState.caravan, treeGroup)
  
  gameState.caravan.path = [];
  gameState.caravan.waypoints = [];
  gameState.caravan.pathLines = [];
  
  // Add some initial caravan waypoints
  let waypoint1 = Point(gameState.caravan.x + 110, gameState.caravan.y)
  addCaravanWaypoint(gameState, waypoint1);
  let waypoint2 = Point(gameState.caravan.x + 200, gameState.caravan.y)
  addCaravanWaypoint(gameState, waypoint2);
  
  // Calculate the initial direction
  caravanCalcPath(gameState);
  
  // Burning wall of death (^tm)
  gameState.WoD = this.add.rectangle(-100,0,100,gameHeight,clrWoD).setOrigin(0,0);

  // let emitter = this.add.particles('bush').createEmitter({
  //   x: 0,
  //   y: 0,
  //   alpha: { start: 1, end: 0 },
  //   speed: { min: 0, max: 800 },
  //   angle: { min: -90, max: 90 },
  //   rotate: { min: 60, max: 120 },
  //   scale: { start: 0.5, end: 0 },
  //   blendMode: 'ADD',
  //   tint: 0xff0000,
  //   //active: false,
  //   lifespan: 600,
  //   // gravityY: 800,
  //   on: false,
  // });

// gameState.WoD.emitter = emitter;


// gameState.Burned = this.add.rectangle(0,0,gameState.WoD.x,gameHeight,clrWoD).setOrigin(0,0);
// emitter0.forEach(function(particle) {
//   particle.tint=0xFF0000;
//   }
// )

}
// ----- End create -----

// ----- Start update -----
function update(time, delta) {
  gameState.currentScene = this
  gameState.frameCount += 1
  
  movePlayer(gameState)
  
  if (gameState.player.body.velocity?.x !== 0 || gameState.player.body.velocity?.y !== 0) {
    drawVisionPlayer(gameState);
  }

  dropWaypoint(gameState);
  
  if (gameState.caravan.path.length > 0){
    removeWaypointIfClose(gameState)
  }
  if (gameState.caravan.path.length > 0){
    moveCaravan(gameState);
  }
  
  gameState.fowCanvas.refresh(); 
  
  const cam = gameState.currentScene.cameras.main;
  let curCamX = Math.max(gameState.player.x,gameState.WoD.x+(2*canvasWidth/4));
  // curCamX = gameState.player.x;
  cam.centerOn(curCamX,gameState.player.y);
  // cam.centerOn(gameState.player.x,gameState.player.y);
  
  moveWoD(gameState)
  checkWinLoseConditions(gameState)
}

function checkWinLoseConditions(gameState){
  // Lose if wall of death touches caravan
  if (gameState.WoD.x > gameState.caravan.x){
    // console.log('You lose! Good day Sir!')
    // Phaser.pause()
  }
}

function caravanCalcPath(gameState){
  const dx = gameState.caravan.path[0].x - gameState.caravan.x
  const dy = gameState.caravan.path[0].y - gameState.caravan.y
  
  // Get the angle of directional vector
  const curAngle = Math.atan2(dy,dx);
  // And the normalized direction
  gameState.caravan.moveX = Math.cos(curAngle)
  gameState.caravan.moveY = Math.sin(curAngle)
  
  // Rotate caravan to align with direction of movement
  gameState.caravan.rotation = Math.PI/2 + curAngle;
}

function moveWoD(gameState){
  gameState.WoD.x += gameState.wallSpeed
  // gameState.WoD.width += gameState.wallSpeed
  // gameState.WoD.emitter.x = gameState.WoD.x;
  // gameState.WoD.emitter.y = gameHeight*Math.random();

  // gameState.WoD.emitter.emitParticleAt(gameState.WoD.x+20,gameHeight*Math.random());
  // gameState.WoD.emitter.emitParticleAt(gameState.WoD.x+20,gameHeight*Math.random());
  // gameState.WoD.emitter.emitParticleAt(gameState.WoD.x+20,gameHeight*Math.random());
  // gameState.WoD.emitter.emitParticleAt(gameState.WoD.x+20,gameHeight*Math.random());

}

function removeWaypointIfClose(gameState) {
  /* Check if caravan is close to first waypoint, and if it is, remove the waypoint */
  const dx = gameState.caravan.path[0].x - gameState.caravan.x
  const dy = gameState.caravan.path[0].y - gameState.caravan.y
  
  const minDist = 100// Minimum distance to move caravan
  // const minDist = gameState.caravan.moveSpeed // Minimum distance to move caravan
  // If caravan is close to the point
  if ((dx*dx + dy*dy) <= minDist) {
    gameState.caravan.setVelocityX(0)
    gameState.caravan.setVelocityY(0)
    
    // Remove a point
    removeCaravanFirstPoint(gameState)
  }
}

function moveCaravan(gameState){
  if ((gameState.frameCount%10) == 0) {
    caravanCalcPath(gameState)
  }
  // Move the caravan in direction, with speed
  // gameState.caravan.x += gameState.caravan.moveX * gameState.caravan.moveSpeed;
  // gameState.caravan.y += gameState.caravan.moveY * gameState.caravan.moveSpeed;
  gameState.caravan.setVelocityX(gameState.caravan.moveX * gameState.caravan.moveSpeed)
  gameState.caravan.setVelocityY(gameState.caravan.moveY * gameState.caravan.moveSpeed)
  
  // // Change the coordinates of the pathlines, such that pathline is drawn from caravan to point
  // gameState.caravan.curPathLine.geom.x1 = gameState.caravan.x;
  // gameState.caravan.curPathLine.geom.y1 = gameState.caravan.y;
  
  // Draw vision around caravan
  drawVisionCaravan(gameState);

  // Draw line from caravan to waypoint
  if (typeof gameState.caravan.curPathLine === "undefined") {
    const newLine = gameState.currentScene.add.line(
      0, 0, 
      gameState.caravan.x, gameState.caravan.y, 
      gameState.caravan.path[0].x, gameState.caravan.path[0].y, 
      clrCaravan
    ).setOrigin(0,0).setLineWidth(0.5,0.5);
    gameState.caravan.curPathLine = newLine

  } else {
    gameState.caravan.curPathLine.geom.x1 = gameState.caravan.x;
    gameState.caravan.curPathLine.geom.y1 = gameState.caravan.y;
  }
}

function addCaravanWaypointLine(gameState, newPoint) {
  // Draw a line between the two latest waypoints
  const prevPoint = gameState.caravan.path[gameState.caravan.path.length-2];
  const newLine = gameState.currentScene.add.line(0, 0, prevPoint.x, prevPoint.y, newPoint.x, newPoint.y, clrCaravan).setOrigin(0,0).setLineWidth(0.5,0.5);
  gameState.caravan.pathLines.push(newLine);
}

function addCaravanWaypoint(gameState, newPoint){
  // Add a waypoint to the caravan
  gameState.caravan.path.push(newPoint)

  let newPointImage = gameState.currentScene.add.image(newPoint.x + 1, newPoint.y - 14, 'flag').setScale(0.25);
  gameState.caravan.waypoints.push(newPointImage);

  if (gameState.caravan.path.length > 1) {
    addCaravanWaypointLine(gameState, newPoint)
  }
}

function movePlayer(gameState) {
  /* Update player position */

  // Set velocity in X
  if (gameState.cursorKeys.right.isDown) {
    gameState.player.setVelocityX(speedX)
  }
  if (gameState.cursorKeys.left.isDown) {
    gameState.player.setVelocityX(-speedX)
  }
  if (gameState.cursorKeys.right.isUp && gameState.cursorKeys.left.isUp) {
    gameState.player.setVelocityX(0)
  }

  // Set velocity in Y
  if (gameState.cursorKeys.down.isDown) {
    gameState.player.setVelocityY(speedY)
  }
  if (gameState.cursorKeys.up.isDown) {
    gameState.player.setVelocityY(-speedY)
  }
  if (gameState.cursorKeys.down.isUp && gameState.cursorKeys.up.isUp) {
    gameState.player.setVelocityY(0)
  }
  
  // const cam = gameState.currentScene.cameras.main;
  // cam.centerOn(gameState.player.x,gameState.player.y);
}

function dropWaypoint(gameState) {
  if (Phaser.Input.Keyboard.JustUp(gameState.cursorKeys.space)) {    
    addCaravanWaypoint(gameState, Point(gameState.player.x, gameState.player.y))
  }
  if (Phaser.Input.Keyboard.JustUp(gameState.cursorKeys.shift)) {    
    removeCaravanlastPoint(gameState)
  }
}

function removeCaravanFirstPoint(gameState){
  /* Remove the first point from the path list, the first waypoint from list of waypoints,
     and if one or more path lines exist, also remove the first one.
     
     If this action leaves the path list empty, remove curPathLine from the caravan,
     otherwise just update the curPathLine to point from the new "first" waipoint.
  */
  gameState.caravan.path.shift(0, 1);
  gameState.caravan.waypoints.shift(0, 1).destroy();
  gameState.caravan.pathLines.shift(0, 1)?.destroy();

  if (gameState.caravan.path.length === 0) {
    gameState.caravan.curPathLine?.destroy();
    delete gameState.caravan.curPathLine;
  } else {
    gameState.caravan.curPathLine.geom.x2 = gameState.caravan.path[0].x;
    gameState.caravan.curPathLine.geom.y2 = gameState.caravan.path[0].y;
  }
}
function removeCaravanlastPoint(gameState){
  if (gameState.caravan.path.length > 1) {
    gameState.caravan.path.pop();
    gameState.caravan.waypoints.pop().destroy();
    gameState.caravan.pathLines.pop().destroy();  
  } else if  (gameState.caravan.path.length == 1) {
    gameState.caravan.setVelocity(0,0);
    gameState.caravan.path.pop();
    gameState.caravan.waypoints.pop().destroy();
    // gameState.caravan.curPathLine.destroy()
    gameState.caravan.curPathLine.geom.x1 = 0;
    gameState.caravan.curPathLine.geom.y1 = 0;
    gameState.caravan.curPathLine.geom.x2 = 0;
    gameState.caravan.curPathLine.geom.y2 = 0;
  }
}

function drawVisionPlayer(gameState) {
  const context = gameState.fowCanvas.context;
  context.beginPath();
  context.arc(gameState.player.x, gameState.player.y, gameState.player.visionRadius, 0, 2 * Math.PI);
  context.fill();
}

function drawVisionCaravan(gameState){
  const context = gameState.fowCanvas.context;
  context.beginPath();
  context.arc(gameState.caravan.x, gameState.caravan.y, gameState.caravan.visionRadius, 0, 2 * Math.PI);
  context.fill();
}


const game = new Phaser.Game(config);
