class Level extends Phaser.Scene {

  constructor (level) {
    const levelName = `Level${level}`;
    super({ key: levelName, active: false});

    this.level = level
    this.levelName = levelName;
    this.gameWidth = 6400;
    this.gameHeight = 1600;
    this.progressBarWidth = 0.8  // Fraction of canvas width
    this.speedX = 200;
    this.speedY = speedX;

    this.flickerSize = 5;
    this.maxFlicker = 100;
    this.minFlicker = -50;
    // Set various game-related properties
    this.gameState = {};
    this.gameState.wallSpeed = 1;
    this.gameState.visionPlayer = 1500;
    // this.gameState.visionCaravan = 200;
    // this.gameState.winXPos = gameWidth - 100;
    this.gameState.winXPos = 500;
    this.gameState.score = 0;
    this.gameState.chestPoints = 5000;
    this.gameState.playerSettings = {};
    this.gameState.playerSettings.screenshake = true;
    this.gameState.gameRunning = true;
  }

  preload() {
    loadImage(this, 'treePine', 'treePine.png')
    loadImage(this, 'flag', 'flag.png')
    loadImage(this, 'chest', 'chest.png')
    loadImage(this, 'flame', 'bush.png')
    loadImage(this, 'player', 'elementDiamond.png');
    loadImage(this, 'caravan', 'arrowSmall.png');
    this.load.image('backgroundPaper', 'assets/cartographypack/Textures/parchmentBasic.png')
    this.load.image(this.levelName, `assets/${this.levelName}.png`)
    this.load.image('fowImg', 'assets/fow.png')
    this.load.image('mask', 'assets/mask.png');
  }

  create(data) {
    console.log(`${this.levelName} has just been started`)
    this.gameState.currentScene = this
    this.gameState.frameCount = 0;
    this.gameState.cursorKeys = this.input.keyboard.createCursorKeys();

    this.input.keyboard.on('keyup-R', () => {
      this.add.text(500, 500, "Restarting level ...")
      this.registry.destroy();
      this.events.off();
      this.scene.restart();
      this.gameState.gameRunning = true;
    });

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
        curPixelVal = this.textures.getPixel(i,j,this.levelName);
        
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
          chestGroup.create(i*10 , j*10, 'chest').setScale(0.3).refreshBody().setSize(25,25);
        }
      }
    }
  
    this.gameState.player = this.physics.add.sprite(400, 400, 'player').setScale(0.2).setCircle(50);
    this.gameState.player.setBounce(0.2);
    // this.gameState.player.setCollideWorldBounds(true)
    this.gameState.player.setInteractive();
    this.gameState.player.visionRadius = 120;
    
    // Add collision between player and all trees
    this.physics.add.collider(this.gameState.player, treeGroup)
    // ... and between the player and the chests
    this.physics.add.overlap(this.gameState.player, chestGroup, (player, chest) => {
      this.gameState.score += this.gameState.chestPoints;
      this.cameras.main.shake(1)
      chest.destroy()
    })
    
    // Fog of War
    const fowImg = this.add.image(0, 0, 'fowImg').setOrigin(0);
    const spotlight = this.make.sprite({
      x: 0,
      y: 0,
      key: 'mask',
      add: false
    });
    
    spotlight.displayWidth = this.gameState.visionPlayer;
    spotlight.displayHeight = this.gameState.visionPlayer;
    
  
    fowImg.setMask(new Phaser.Display.Masks.BitmapMask(this, spotlight));
    // fowImg.maskCaravan = new Phaser.Display.Masks.BitmapMask(this, spotlightCaravan);
  
    fowImg.mask.invertAlpha = true;
    // fowImg.maskCaravan.invertAlpha = true;
  
    // console.log(fowImg);
  
    this.gameState.spotlight = spotlight;
    // this.gameState.spotlightCaravan = spotlightCaravan;
    
    drawVisionPlayer(this.gameState);
      
    // Burning wall of death (^tm)
    const WodInit = 100 
    const WodPartsWidth = WodInit/10;
    this.gameState.WoD = this.add.rectangle(-WodInit,0,WodInit,gameHeight,'0x362a28').setOrigin(0,0);
    this.gameState.WoD2 = this.add.rectangle(-WodPartsWidth*3,0,WodPartsWidth,gameHeight,'0xfffd6b').setOrigin(0,0).setBlendMode(Phaser.BlendModes.ADD);
    this.gameState.WoD3 = this.add.rectangle(-WodPartsWidth*2,0,WodPartsWidth,gameHeight,'0x662d00').setOrigin(0,0).setBlendMode(Phaser.BlendModes.ADD);
    this.gameState.WoD4 = this.add.rectangle(-WodPartsWidth,0,WodPartsWidth,gameHeight,'0x661000').setOrigin(0,0).setBlendMode(Phaser.BlendModes.ADD);
  
    // Caravan 
    this.gameState.caravan = this.physics.add.sprite(this.gameState.player.x/2, this.gameState.player.y, 'caravan').setSize(50, 50)
    this.gameState.caravan.moveSpeed = 100;
    this.gameState.caravan.visionRadius = 300;
    this.gameState.caravan.setInteractive();
    this.physics.add.collider(this.gameState.caravan, treeGroup)
    
    this.gameState.caravan.path = [];
    this.gameState.caravan.waypoints = [];
    this.gameState.caravan.pathLines = [];
    
    // Add some initial caravan waypoints
    // let waypointGroup = this.physics.add.staticGroup();
    let waypoint1 = Point(this.gameState.caravan.x + 110, this.gameState.caravan.y)
    addCaravanWaypoint(this.gameState, waypoint1);
    let waypoint2 = Point(this.gameState.caravan.x + 200, this.gameState.caravan.y)
    addCaravanWaypoint(this.gameState, waypoint2);
    
    // Calculate the initial direction
    caravanCalcPath(this.gameState);
    
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
  
    this.gameState.WoD.emitter = emitter;
    // this.cameras.main.setBounds(gameState.WoD.x, 0, gameWidth-gameState.WoD.x, gameHeight);
    this.cameras.main.setBounds(0, 0, gameWidth-this.gameState.WoD.x, gameHeight);
  
    // Add progress bar
    addProgressBar(this.gameState);
  }

  update(time, delta) {
    this.gameState.currentScene = this
    this.gameState.frameCount += 1

    if (this.gameState.gameRunning) { 
        // Do player related stuff
        movePlayer(this.gameState)
        if (this.gameState.player.body.velocity?.x !== 0 || this.gameState.player.body.velocity?.y !== 0) {
        drawVisionPlayer(this.gameState);
        }
    
        // Do caravan related stuff
        /* Add a waypoint to the waypoint list. If there is now more than one waypoint,
        also add a new line between the waypoints */  
        if (Phaser.Input.Keyboard.JustUp(this.gameState.cursorKeys.space)) {    
        addCaravanWaypoint(this.gameState)
        }
        // Remove the last placed waypoint from the map
        if (Phaser.Input.Keyboard.JustUp(this.gameState.cursorKeys.shift)) {    
        removeCaravanLastPoint(this.gameState)
        }

        // let keyObj = this.gameState.currentScene.input.keyboard.addKey('r');  // Get key object
        // let r_isDown = keyObj.isDown;
        // // var isUp = keyObj.isUp; 
        // if (r_isDown){
        //     console.log('asdf')
        // }
        // var keyObj = this.gameState.currentScene.input.keyboard.addKey('W');  // Get key object
        // keyObj.on('up', function(event) {
        //         console.log('asdf')
        //     });

        // If caravan is within range of the waypoint it's moving to, remove that waypoint
        if (this.gameState.caravan.path.length > 0){
        removeWaypointIfClose(this.gameState)
        }
    
        // If there are more waypoints left, move towards the first of those
        if (this.gameState.caravan.path.length > 0){
        // Move the caravan
        moveCaravan(this.gameState);
    
        // Draw line between caravan and first waypoint
        drawCaravanWaypointLine(this.gameState);
        }
    
        // Screenshake when close to WoD
        if (this.gameState.playerSettings.screenshake){
            if ((this.gameState.player.x - (this.gameState.WoD.x + this.gameState.WoD.width)) < (canvasWidth*0.1)){
            this.gameState.currentScene.cameras.main.shake(100,0.005);
            }
            if ((this.gameState.player.x - (this.gameState.WoD.x + this.gameState.WoD.width)) < (canvasWidth*0.33)){
            this.gameState.currentScene.cameras.main.shake(100,0.002);
            }
            if ((this.gameState.player.x - (this.gameState.WoD.x + this.gameState.WoD.width)) < (canvasWidth*0.6)){
            this.gameState.currentScene.cameras.main.shake(100,0.0015);
            }
        }
        if (this.gameState.caravan.path.length > 0){
        // Move the caravan
        moveCaravan(this.gameState);
    
        // Draw line between caravan and first waypoint
        drawCaravanWaypointLine(this.gameState);

        }
        
        if ((this.gameState.frameCount % 4) == 0){
        // Random walk around the vision size
        flickerSize += 50* (Math.random()-0.5); 
        // But above some minimum, and below some maximum
        if (flickerSize < minFlicker){
            flickerSize = minFlicker
        }
        if (flickerSize > maxFlicker){
            flickerSize = maxFlicker
        }
            this.gameState.spotlight.displayWidth = this.gameState.visionPlayer + flickerSize;
            this.gameState.spotlight.displayHeight = this.gameState.visionPlayer + flickerSize;
        }
    
        // if ((this.gameState.frameCount % 10) == 0){
        //   this.gameState.fowCanvas.refresh(); 
        // }
        
        
        const cam = this.gameState.currentScene.cameras.main;
        // let curCamX = Math.max(this.gameState.player.x,this.gameState.WoD.x+(2*canvasWidth/4));
        // curCamX = this.gameState.player.x;
        // cam.centerOn(curCamX,this.gameState.player.y);
        cam.centerOn(this.gameState.player.x,this.gameState.player.y);
        cam.setBounds(Math.max(0,this.gameState.WoD.x), 0, gameWidth-this.gameState.WoD.x, gameHeight);
        // cam.setBounds(0, 0, gameWidth-this.gameState.WoD.x, gameHeight);
        
        updateProgressBar(this.gameState);
    
        moveWoD(this.gameState)
        checkWinLoseConditions(this.gameState)
        
        // Add some points 🤷‍♂️
        this.gameState.score += 1;
    } 
  }
} 

// HERE
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
//   gameState.currentScene.scene.pause();
  gameState.gameRunning = false;

  let textPositionX = gameState.currentScene.cameras.main.worldView.centerX
  let textPositionY = gameState.currentScene.cameras.main.worldView.centerY;
  let loseText = "Congratulations! You lost!"
  gameState.currentScene.add.text(textPositionX, textPositionY, loseText).setOrigin(0.5, 0.5);
//   gameState.currentScene.scene.restart();
}

function winLevel(gameState) {
  console.log("Entereed winLevel function")
  let textPositionX = gameState.currentScene.cameras.main.worldView.centerX
  let textPositionY = gameState.currentScene.cameras.main.worldView.centerY;
  let winText = "Oh no! You won"

  // Unlock next level
  console.log(gameState.currentScene.levelName)
  if (gameState.currentScene.levelName == 'Level1'){
    winText += ` level ${gameState.currentScene.level}! Now on to level ${gameState.currentScene.level + 1}!`
    gameState.currentScene.add.text(textPositionX, textPositionY, winText)
    level2Unlocked = true
    gameState.currentScene.time.addEvent({
        delay: 3000,
        loop: false,
        callback: () => {
          gameState.currentScene.scene.start("Level2");
        }
    });
  }
  if (gameState.currentScene.levelName == 'Level2'){
    winText += ` level ${gameState.currentScene.level}! Now on to level ${gameState.currentScene.level + 1}!`
    gameState.currentScene.add.text(textPositionX, textPositionY, winText)
    level3Unlocked = true
    gameState.currentScene.time.addEvent({
      delay: 3000,
      loop: false,
      callback: () => {
        gameState.currentScene.scene.start("Level3");
      }
  });
  }
  if (gameState.currentScene.levelName == 'Level3'){
    winText += ` The Game!`
    gameState.currentScene.add.text(textPositionX, textPositionY, winText)
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
  // Move the spotlight sprite to the player position
  gameState.spotlight.x = gameState.player.x;
  gameState.spotlight.y = gameState.player.y;
}
