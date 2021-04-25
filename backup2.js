// Set various game-related properties
const gameState = {}
gameState.wallSpeed = 1;
gameState.visionPlayer = 1500;
// gameState.visionCaravan = 200;
gameState.winXPos = gameWidth - 100;
gameState.curLevel = 'level1'
gameState.score = 0;
gameState.chestPoints = 5000;

const config = {
  // type: Phaser.WEBGL,
  type: Phaser.AUTO,
  width: canvasWidth,
  height: canvasHeight,
  backgroundColor: clrBackground,
  physics: {
    default: 'arcade',
    arcade: {
        gravity: { x: 0, y: 0 },
        debug: false
    }
  },
  scene: [
    {
    preload,
    create,
    update
    },
    mainMenu,
  ]
}

function preload (){
  loadImage(this, 'treePine', 'treePine.png')
  loadImage(this, 'flag', 'flag.png')
  loadImage(this, 'chest', 'chest.png')
  loadImage(this, 'flame', 'bush.png')
  loadImage(this, 'player', 'elementDiamond.png');
  loadImage(this, 'caravan', 'arrowSmall.png');
  this.load.image('backgroundPaper', 'assets/cartographypack/Textures/parchmentBasic.png')
  // this.load.image('testMap', 'assets/LudumDareMainMap.png')
  this.load.image('testMap', 'assets/Level1.png')
  // this.load.image('testMap', 'assets/Level3.png')
  // this.load.image('testMap', 'assets/empty.png')
  // this.load.image('testMap', 'assets/testMap.png')

  this.load.image('fowImg', 'assets/fow.png')
  this.load.image('mask', 'assets/mask.png');
}

// ----- Start create -----
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

  let chestGroup = this.physics.add.staticGroup();
  let treeGroup = this.physics.add.staticGroup();
  let mapWidth = 640;
  let mapHeight = 160;
  let curPixelVal
  for (let i = 0; i < mapWidth; i++) {
    for (let j = 0; j < mapHeight; j++) { 
      curPixelVal = this.textures.getPixel(i,j,'testMap');
      
      if (curPixelVal.g > 0) {
        if (curPixelVal.g == 255) {
        treeGroup.create(i*10, j*10, 'treePine').setScale(0.3).refreshBody().setSize(15,25);
        } else {
          if (255*Math.random() < curPixelVal.g){
            treeGroup.create(i*10, j*10, 'treePine').setScale(0.3).refreshBody().setSize(15,25);
          }
        }
      }
      if (curPixelVal.b == 255){
        chestGroup.create(i*10,j*10,'chest').setScale(0.3).refreshBody().setSize(25,25);
      }
    }
  }

  gameState.player = this.physics.add.sprite(400, 400, 'player').setScale(0.2).setCircle(50);
  gameState.player.setBounce(0.2);
  // gameState.player.setCollideWorldBounds(true)
  gameState.player.setInteractive();
  gameState.player.visionRadius = 120;
  
  // Add collision between player and all trees
  this.physics.add.collider(gameState.player, treeGroup)
  // ... and between the player and the chests
  this.physics.add.overlap(gameState.player, chestGroup,function (player,chest){
    chest.destroy()
    gameState.score += gameState.chestPoints;
    gameState.currentScene.cameras.main.shake(100,0.02);
  })
  
  // Fog of War
  const fowImg = this.add.image(0, 0, 'fowImg').setOrigin(0);
  const spotlight = this.make.sprite({
    x: 0,
    y: 0,
    key: 'mask',
    add: false
  });
  
  spotlight.displayWidth = gameState.visionPlayer;
  spotlight.displayHeight = gameState.visionPlayer;
  

  fowImg.setMask(new Phaser.Display.Masks.BitmapMask(this, spotlight));
  // fowImg.maskCaravan = new Phaser.Display.Masks.BitmapMask(this, spotlightCaravan);

  fowImg.mask.invertAlpha = true;
  // fowImg.maskCaravan.invertAlpha = true;

  // console.log(fowImg);

  gameState.spotlight = spotlight;
  // gameState.spotlightCaravan = spotlightCaravan;
  
  drawVisionPlayer(gameState);
    
  // Burning wall of death (^tm)
  const WodInit = 100 
  const WodPartsWidth = WodInit/10;
  gameState.WoD = this.add.rectangle(-WodInit,0,WodInit,gameHeight,'0x362a28').setOrigin(0,0);
  gameState.WoD2 = this.add.rectangle(-WodPartsWidth*3,0,WodPartsWidth,gameHeight,'0xfffd6b').setOrigin(0,0).setBlendMode(Phaser.BlendModes.ADD);
  gameState.WoD3 = this.add.rectangle(-WodPartsWidth*2,0,WodPartsWidth,gameHeight,'0x662d00').setOrigin(0,0).setBlendMode(Phaser.BlendModes.ADD);
  gameState.WoD4 = this.add.rectangle(-WodPartsWidth,0,WodPartsWidth,gameHeight,'0x661000').setOrigin(0,0).setBlendMode(Phaser.BlendModes.ADD);

  // Caravan 
  gameState.caravan = this.physics.add.sprite(gameState.player.x/2, gameState.player.y, 'caravan').setSize(50, 50)
  gameState.caravan.moveSpeed = 70;
  gameState.caravan.visionRadius = 300;
  gameState.caravan.setInteractive();
  this.physics.add.collider(gameState.caravan, treeGroup)
  
  gameState.caravan.path = [];
  gameState.caravan.waypoints = [];
  gameState.caravan.pathLines = [];
  
  drawVisionCaravan(gameState);
  
  // Add some initial caravan waypoints
  // let waypointGroup = this.physics.add.staticGroup();
  let waypoint1 = Point(gameState.caravan.x + 110, gameState.caravan.y)
  addCaravanWaypoint(gameState, waypoint1);
  let waypoint2 = Point(gameState.caravan.x + 200, gameState.caravan.y)
  addCaravanWaypoint(gameState, waypoint2);
  
  // Calculate the initial direction
  caravanCalcPath(gameState);
  
  let emitter = this.add.particles('flame').createEmitter({
    x: 0,
    y: 0,
    alpha: { start: 1, end: 0 },
    // alpha: 1,
    speed: { min: 0, max: 800 },
    angle: { min: -90, max: 90 },
    rotate: { min: 60, max: 120 },
    scale: { start: 0.5, end: 0 },
    blendMode: 'NORMAL',
    lifespan: 600,
    on: false,
  });

  // emitter.tint.onChange('#ff0000')

  gameState.WoD.emitter = emitter;
  // this.cameras.main.setBounds(gameState.WoD.x, 0, gameWidth-gameState.WoD.x, gameHeight);
  this.cameras.main.setBounds(0, 0, gameWidth-gameState.WoD.x, gameHeight);


  // Add progress bar
  addProgressBar(gameState);
  

}
// ----- End create -----

// ----- Start update -----
function update(time, delta) {
  gameState.currentScene = this
  gameState.frameCount += 1
  // Do player related stuff
  movePlayer(gameState)
  if (gameState.player.body.velocity?.x !== 0 || gameState.player.body.velocity?.y !== 0) {
    drawVisionPlayer(gameState);
  }

  // Do caravan related stuff
  /* Add a waypoint to the waypoint list. If there is now more than one waypoint,
     also add a new line between the waypoints */  
  if (Phaser.Input.Keyboard.JustUp(gameState.cursorKeys.space)) {    
    addCaravanWaypoint(gameState)
  }
  // Remove the last placed waypoint from the map
  if (Phaser.Input.Keyboard.JustUp(gameState.cursorKeys.shift)) {    
    removeCaravanLastPoint(gameState)
  }
  
  // If caravan is within range of the waypoint it's moving to, remove that waypoint
  if (gameState.caravan.path.length > 0){
    removeWaypointIfClose(gameState)
  }

  // If there are more waypoints left, move towards the first of those
  if (gameState.caravan.path.length > 0){
    // Move the caravan
    moveCaravan(gameState);

    // Draw line between caravan and first waypoint
    drawCaravanWaypointLine(gameState);

    // Draw vision around caravan
    drawVisionCaravan(gameState);
  }

  // Screenshake when close to WoD
  if ((gameState.player.x - (gameState.WoD.x + gameState.WoD.width)) < (canvasWidth*0.1)){
    gameState.currentScene.cameras.main.shake(100,0.005);
  }
  if ((gameState.player.x - (gameState.WoD.x + gameState.WoD.width)) < (canvasWidth*0.33)){
    gameState.currentScene.cameras.main.shake(100,0.002);
  }
  if ((gameState.player.x - (gameState.WoD.x + gameState.WoD.width)) < (canvasWidth*0.6)){
    gameState.currentScene.cameras.main.shake(100,0.0015);
  }

  
  if ((gameState.frameCount % 4) == 0){
    // Random walk around the vision size
    flickerSize += 50* (Math.random()-0.5); 
    // But above some minimum, and below some maximum
    if (flickerSize < minFlicker){
      flickerSize = minFlicker
    }
    if (flickerSize > maxFlicker){
      flickerSize = maxFlicker
    }
  gameState.spotlight.displayWidth = gameState.visionPlayer + flickerSize;
  gameState.spotlight.displayHeight = gameState.visionPlayer + flickerSize;
  }

  // if ((gameState.frameCount % 10) == 0){
  //   gameState.fowCanvas.refresh(); 
  // }
  
  const cam = gameState.currentScene.cameras.main;
  // let curCamX = Math.max(gameState.player.x,gameState.WoD.x+(2*canvasWidth/4));
  // curCamX = gameState.player.x;
  // cam.centerOn(curCamX,gameState.player.y);
  cam.centerOn(gameState.player.x,gameState.player.y);
  cam.setBounds(Math.max(0,gameState.WoD.x), 0, gameWidth-gameState.WoD.x, gameHeight);
  // cam.setBounds(0, 0, gameWidth-gameState.WoD.x, gameHeight);
  
  updateProgressBar(gameState);

  moveWoD(gameState)
  checkWinLoseConditions(gameState)
  
  // Add some points 🤷‍♂️
  gameState.score += 1;

}
// ----- End update -----


function addProgressBar(gameState) {
  const mainCam = gameState.currentScene.cameras.main.worldView;
  
  // Create a container to hold the progress bar and sprites that represent the different entities
  gameState.container = gameState.currentScene.add.container(mainCam.left, mainCam.top);
  
  // Create the progress bar line
  const progressBarY = mainCam.bottom - 20;
  let line = gameState.currentScene.add.line(
    mainCam.centerX, progressBarY, 
    0, 0, mainCam.width, 0,
    clrProgressBar
  ).setLineWidth(5).setOrigin(0.5, 0.5);
  gameState.container.add(line);
  gameState.container.progressBarLine = line;  // Add alias to the progressBarLine object

  // Add score text
  let scoreText = gameState.currentScene.add.text(mainCam.centerX, 20, `SCORE: ${gameState.score}`,{ font: '32px Arial' }).setOrigin(0.5, 0.5);
  scoreText.setColor(0xffffff);
  gameState.container.add(scoreText);
  gameState.container.scoreText = scoreText;  // Add alias to the scoreText object

  // Add WoD indicator on the progress bar
  const wodIndicatorX = getIndicatorX((gameState.WoD.x + gameState.WoD.width), mainCam);
  let wodIndicatorBig = gameState.currentScene.add.image(wodIndicatorX + 100, progressBarY, 'flame').setOrigin(0.5, 1).setScale(0.8);
  let wodIndicatorSmall = gameState.currentScene.add.image(wodIndicatorX + 100, progressBarY, 'flame').setOrigin(0.5, 1).setScale(0.5);
  gameState.container.add(wodIndicatorBig);
  gameState.container.add(wodIndicatorSmall);
  gameState.container.wodIndicators = { big: wodIndicatorBig, small: wodIndicatorSmall };  // Add alias to the wodIndicator objects

  // Add player indicator on the progress bar
  const playerIndicatorX = getIndicatorX(gameState.player.x, mainCam);
  let playerIndicator = gameState.currentScene.add.image(playerIndicatorX + 100, progressBarY, 'player').setOrigin(0.5, 1).setScale(0.3);
  gameState.container.add(playerIndicator);
  gameState.container.playerIndicator = playerIndicator;  // Add alias to the playerIndicator object

  // Add player indicator on the progress bar
  const caravanIndicatorX = getIndicatorX(gameState.caravan.x, mainCam);
  let caravanIndicator = gameState.currentScene.add.image(
    caravanIndicatorX, progressBarY - 20, 'caravan').setRotation(Math.PI/2).setOrigin(0.5, 1).setScale(0.4);
  gameState.container.add(caravanIndicator);
  gameState.container.caravanIndicator = caravanIndicator;  // Add alias to the caravanIndicator object
}

function updateProgressBar(gameState) {
  const mainCam = gameState.currentScene.cameras.main.worldView;
  gameState.container.x = mainCam.left;
  gameState.container.y = mainCam.top;

  // Update score text
  gameState.container.scoreText.setText(`SCORE: ${gameState.score}`);

  // Update position of WoD indicator(s)
  const wodIndicatorX = getIndicatorX((gameState.WoD.x + gameState.WoD.width), mainCam)
  gameState.container.wodIndicators.big.x = wodIndicatorX;
  gameState.container.wodIndicators.small.x = wodIndicatorX;

  // Update position of player indicator
  const playerIndicatorX = getIndicatorX(gameState.player.x, mainCam)
  gameState.container.playerIndicator.x = playerIndicatorX;
  
  // Update position of caravan indicator
  const caravanIndicatorX = getIndicatorX(gameState.caravan.x, mainCam)
  gameState.container.caravanIndicator.x = caravanIndicatorX;
}

function getIndicatorX(trackingObjectX, mainCam) {
  const indicatorProgress = 1 - (gameWidth - trackingObjectX) / gameWidth;
  const indicatorX = indicatorProgress * mainCam.width + 100;
  return indicatorX
}

function checkWinLoseConditions(gameState){
  // Lose if wall of death touches caravan
  if ((gameState.WoD.x + gameState.WoD.width) > gameState.caravan.x){
    loseGame(gameState)
  }
  // Lose if wall of death touches player
  if ((gameState.WoD.x + gameState.WoD.width) > gameState.player.x){
    loseGame(gameState)
  }
  // Win if caravan has reached end
  if (gameState.caravan.x >= gameState.winXPos){
    winLevel(gameState)
  }
}

function loseGame(gameState) {
  gameState.currentScene.scene.pause();

  let textPositionX = gameState.currentScene.cameras.main.worldView.centerX
  let textPositionY = gameState.currentScene.cameras.main.worldView.centerY;
  let loseText = "Congratulations! You lost!"
  gameState.currentScene.add.text(textPositionX, textPositionY, loseText).setOrigin(0.5, 0.5);
}

function winLevel(gameState) {
  gameState.currentScene.scene.pause();

  let textPositionX = gameState.currentScene.cameras.main.worldView.centerX
  let textPositionY = gameState.currentScene.cameras.main.worldView.centerY;
  let winText = "Oh no! You won!"
  gameState.currentScene.add.text(textPositionX, textPositionY, winText)//.setOrigin(0.5, 0.5);

  // Unlock next level
  if (gameState.curLevel == 'level1'){
    level2Unlocked = true
  }
  if (gameState.curLevel == 'level2'){
    level3Unlocked = true
  }
  if (gameState.curLevel == 'level3'){
    gameFinished = true
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
  gameState.WoD2.x += gameState.wallSpeed
  gameState.WoD3.x += gameState.wallSpeed
  gameState.WoD4.x += gameState.wallSpeed
  // gameState.WoD.width += gameState.wallSpeed

  // gameState.WoD.emitter.x = gameState.WoD.x;
  // gameState.WoD.emitter.y = gameHeight*Math.random();

  gameState.WoD.emitter.emitParticleAt(gameState.WoD.x+gameState.WoD.width,gameHeight*Math.random());
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
}

function drawCaravanWaypointLine(gameState) {
  /* If a line exists from caravan to waypoint, update the current line.
     If one doesn't exist, create a new line between the caravan and the 
     first waypoint. 
  */
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
  // Logger.DEBUG("addCaravanWaypointLine")
  // Draw a line between the two latest waypoints
  const prevPoint = gameState.caravan.path[gameState.caravan.path.length-2];
  const newLine = gameState.currentScene.add.line(0, 0, prevPoint.x, prevPoint.y, newPoint.x, newPoint.y, clrCaravan).setOrigin(0,0).setLineWidth(0.5,0.5);
  gameState.caravan.pathLines.push(newLine);
}

function addCaravanWaypoint(gameState, newPoint){
  // Logger.DEBUG("addCaravanWaypoint")

  // If newPoint is not explicitly passed in, add waypoint to current player position
  newPoint = newPoint || Point(gameState.player.x, gameState.player.y)
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
function removeCaravanLastPoint(gameState){
  /* Remove the latest added waypoint 
  */
  if (gameState.caravan.path.length > 0) {
    gameState.caravan.path.pop();
    gameState.caravan.waypoints.pop().destroy();
    gameState.caravan.pathLines.pop()?.destroy();
  }

  // If there are no waypoints left, set the caravan velocity to 0
  // and delete the line from caravan to waypoint
  if (gameState.caravan.path.length === 0) {
    gameState.caravan.setVelocity(0,0);
    gameState.caravan.curPathLine?.destroy();
    delete gameState.caravan.curPathLine;
  }
}

function drawVisionPlayer(gameState) {
  // const context = gameState.fowCanvas.context;
  // context.beginPath();
  // context.arc(gameState.player.x, gameState.player.y, gameState.player.visionRadius, 0, 2 * Math.PI);
  // context.fill();

  // gameState.spotlight.x = gameState.player.x-gameState.spotlight.width/2;
  // gameState.spotlight.y = gameState.player.y-gameState.spotlight.height/2;
  gameState.spotlight.x = gameState.player.x;
  gameState.spotlight.y = gameState.player.y;
}

function drawVisionCaravan(gameState){
  // gameState.spotlightCaravan.x = gameState.caravan.x;
  // gameState.spotlightCaravan.y = gameState.caravan.y;
  // const context = gameState.fowCanvas.context;
  // context.beginPath();
  // context.arc(gameState.caravan.x, gameState.caravan.y, gameState.caravan.visionRadius, 0, 2 * Math.PI);
  // context.fill();
}


const game = new Phaser.Game(config);
