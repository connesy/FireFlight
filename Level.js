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
    this.gameState.wallSpeed = 0.8;
    this.gameState.visionPlayer = 600; // Is modified later, based on the level
    // this.gameState.visionCaravan = 200;
    this.gameState.winXPos = gameWidth - 100;
    // this.gameState.winXPos = 500;
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
    // console.log(`${this.levelName} has just been started`)
    this.gameState.frameCount = 0;
    this.gameState.isPaused = false;
    this.gameState.cursorKeys = this.input.keyboard.createCursorKeys();

    this.input.keyboard.on('keyup-R', () => {
      this.add.text(500, 500, "Restarting level ...")
      this.registry.destroy();
      this.events.off();
      this.scene.restart();
      this.gameState.gameRunning = true;
    });

    this.input.keyboard.on('keyup-P', () => {
      if (!this.gameState.isPaused) {
        this.gameState.isPaused = true;
        this.gameState.gameRunning = false;
        this.pausedText = this.add.text(500, 500, "Game paused ...")
        // this.scene.pause();
        // this.scene.launch('Paused');
      } else {
        // this.scene.resume();
        this.gameState.isPaused = false;
        this.gameState.gameRunning = true;
        this.pausedText.destroy()
      }
    });

    // Button for returning to main menu
    this.input.keyboard.on('keyup-M', () => {
      this.scene.start('MainMenu');
    });

    this.cameras.main.setBounds(0, 0, gameWidth, gameHeight);
    this.cameras.main.setZoom(1);

    // Set level settings
    if (this.level == 1){
      this.gameState.visionPlayer = 1400
    }
    if (this.level == 2){
      this.gameState.visionPlayer = 1000
    }
    if (this.level == 3){
      this.gameState.visionPlayer = 800
    }
    
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
    
    this.drawVisionPlayer();
      
    // Burning wall of death (^tm)
    const WodInit = 100 
    const WodPartsWidth = WodInit/10;
    this.gameState.WoD = this.add.rectangle(-WodInit,0,WodInit,gameHeight,'0x362a28').setOrigin(0,0);
    this.gameState.WoD2 = this.add.rectangle(-WodPartsWidth*3,0,WodPartsWidth,gameHeight,'0xfffd6b').setOrigin(0,0).setBlendMode(Phaser.BlendModes.ADD);
    this.gameState.WoD3 = this.add.rectangle(-WodPartsWidth*2,0,WodPartsWidth,gameHeight,'0x662d00').setOrigin(0,0).setBlendMode(Phaser.BlendModes.ADD);
    this.gameState.WoD4 = this.add.rectangle(-WodPartsWidth,0,WodPartsWidth,gameHeight,'0x661000').setOrigin(0,0).setBlendMode(Phaser.BlendModes.ADD);
  
    // Caravan 
    this.gameState.caravan = this.physics.add.sprite(this.gameState.player.x/2, this.gameState.player.y, 'caravan').setSize(50, 50)
    this.gameState.caravan.moveSpeed = 150;
    this.gameState.caravan.visionRadius = 300;
    this.gameState.caravan.setInteractive();
    this.physics.add.collider(this.gameState.caravan, treeGroup)
    
    this.gameState.caravan.path = [];
    this.gameState.caravan.waypoints = [];
    this.gameState.caravan.pathLines = [];
    
    // Add some initial caravan waypoints
    // let waypointGroup = this.physics.add.staticGroup();
    let waypoint1 = Point(this.gameState.caravan.x + 110, this.gameState.caravan.y)
    this.addCaravanWaypoint(waypoint1);
    let waypoint2 = Point(this.gameState.caravan.x + 200, this.gameState.caravan.y)
    this.addCaravanWaypoint(waypoint2);
    
    // Calculate the initial direction
    this.caravanCalcPath();
    
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
    this.addProgressBar();
  }

  update(time, delta) {
    this.gameState.frameCount += 1

    if (this.gameState.gameRunning) { 
        /* Do player related stuff */
        this.movePlayer()

        if (Phaser.Input.Keyboard.JustUp(this.gameState.cursorKeys.space)) {    
          this.addCaravanWaypoint()
        }
        // Remove the last placed waypoint from the map
        if (Phaser.Input.Keyboard.JustUp(this.gameState.cursorKeys.shift)) {    
          this.removeCaravanLastPoint()
        }

        if (this.gameState.player.body.velocity?.x !== 0 || this.gameState.player.body.velocity?.y !== 0) {
        this.drawVisionPlayer();
        }
    
        /* Do caravan related stuff */
        // If caravan is within range of the waypoint it's moving to, remove that waypoint
        if (this.gameState.caravan.path.length > 0){
          this.removeWaypointIfClose()
        }
    
        // If there are more waypoints left, move towards the first of those
        if (this.gameState.caravan.path.length > 0){
          // Move the caravan
          this.moveCaravan();
      
          // Draw line between caravan and first waypoint
          this.drawCaravanWaypointLine();
        }
    
        // Screenshake when close to WoD
        if (this.gameState.playerSettings.screenshake){
            if ((this.gameState.player.x - (this.gameState.WoD.x + this.gameState.WoD.width)) < (canvasWidth*0.1)){
            this.cameras.main.shake(100,0.005);
            }
            if ((this.gameState.player.x - (this.gameState.WoD.x + this.gameState.WoD.width)) < (canvasWidth*0.33)){
            this.cameras.main.shake(100,0.002);
            }
            if ((this.gameState.player.x - (this.gameState.WoD.x + this.gameState.WoD.width)) < (canvasWidth*0.6)){
            this.cameras.main.shake(100,0.0015);
            }
        }
        
        if ((this.gameState.frameCount % 4) == 0){
          // Random walk around the vision size
          flickerSize += 50* (Math.random()-0.5); 
          // But above some minimum, and below some maximum
          flickerSize = flickerSize < minFlicker ? minFlicker : flickerSize
          flickerSize = flickerSize > maxFlicker ? maxFlicker : flickerSize

          let curProgressDiff = 400*(this.gameState.player.x/gameWidth);

          this.gameState.spotlight.displayWidth = this.gameState.visionPlayer + flickerSize  -curProgressDiff;
          this.gameState.spotlight.displayHeight = this.gameState.visionPlayer + flickerSize -curProgressDiff;
        }
    
        // if ((this.gameState.frameCount % 10) == 0){
        //   this.gameState.fowCanvas.refresh(); 
        // }
        
        
        const cam = this.cameras.main;
        // let curCamX = Math.max(this.gameState.player.x,this.gameState.WoD.x+(2*canvasWidth/4));
        // curCamX = this.gameState.player.x;
        // cam.centerOn(curCamX,this.gameState.player.y);
        cam.centerOn(this.gameState.player.x, this.gameState.player.y);
        cam.setBounds(Math.max(0,this.gameState.WoD.x), 0, gameWidth-this.gameState.WoD.x, gameHeight);
        // cam.setBounds(0, 0, gameWidth-this.gameState.WoD.x, gameHeight);
        
        this.updateProgressBar();
    
        this.moveWoD()
        this.checkWinLoseConditions()
        
        // Add some points 🤷‍♂️
        this.gameState.score += 1;
    } else { // If game is not running

      // Last-minute fix to make sure caravan is not moving when game is paused
      this.gameState.caravan.setVelocityX(0);
      this.gameState.caravan.setVelocityY(0);
    }
    
    // Show "fire" particles from WoD
    this.gameState.WoD.emitter.emitParticleAt(this.gameState.WoD.x + this.gameState.WoD.width, gameHeight * Math.random());
  }

  addProgressBar() {
    const mainCam = this.cameras.main.worldView;
    
    // Create a container to hold the progress bar and sprites that represent the different entities
    this.gameState.container = this.add.container(mainCam.left, mainCam.top);
    
    // Create the progress bar line
    const progressBarY = mainCam.bottom - 20;
    let line = this.add.line(
      mainCam.centerX, progressBarY, 
      0, 0, mainCam.width, 0,
      clrProgressBar
    ).setLineWidth(5).setOrigin(0.5, 0.5);
    this.gameState.container.add(line);
    this.gameState.container.progressBarLine = line;  // Add alias to the progressBarLine object
  
    // Add score text
    let scoreText = this.add.text(mainCam.centerX, 20, `SCORE: ${this.gameState.score}`, { font: '32px Arial' }).setOrigin(0.5, 0.5);
    scoreText.setColor(0xffffff);
    this.gameState.container.add(scoreText);
    this.gameState.container.scoreText = scoreText;  // Add alias to the scoreText object
  
    // Add WoD indicator on the progress bar
    const wodIndicatorX = this.getIndicatorX((this.gameState.WoD.x + this.gameState.WoD.width), mainCam);
    let wodIndicatorBig = this.add.image(wodIndicatorX + 100, progressBarY, 'flame').setOrigin(0.5, 1).setScale(0.8);
    let wodIndicatorSmall = this.add.image(wodIndicatorX + 100, progressBarY, 'flame').setOrigin(0.5, 1).setScale(0.5);
    this.gameState.container.add(wodIndicatorBig);
    this.gameState.container.add(wodIndicatorSmall);
    this.gameState.container.wodIndicators = { big: wodIndicatorBig, small: wodIndicatorSmall };  // Add alias to the wodIndicator objects
  
    // Add player indicator on the progress bar
    const playerIndicatorX = this.getIndicatorX(this.gameState.player.x, mainCam);
    let playerIndicator = this.add.image(playerIndicatorX + 100, progressBarY, 'player').setOrigin(0.5, 1).setScale(0.3);
    this.gameState.container.add(playerIndicator);
    this.gameState.container.playerIndicator = playerIndicator;  // Add alias to the playerIndicator object
  
    // Add player indicator on the progress bar
    const caravanIndicatorX = this.getIndicatorX(this.gameState.caravan.x, mainCam);
    let caravanIndicator = this.add.image(
      caravanIndicatorX, progressBarY - 20, 'caravan').setRotation(Math.PI/2).setOrigin(0.5, 1).setScale(0.4);
    this.gameState.container.add(caravanIndicator);
    this.gameState.container.caravanIndicator = caravanIndicator;  // Add alias to the caravanIndicator object
  }

  updateProgressBar() {
    const mainCam = this.cameras.main.worldView;
    this.gameState.container.x = mainCam.left;
    this.gameState.container.y = mainCam.top;
  
    // Update score text
    this.gameState.container.scoreText.setText(`SCORE: ${this.gameState.score}`);
  
    // Update position of WoD indicator(s)
    const wodIndicatorX = this.getIndicatorX((this.gameState.WoD.x + this.gameState.WoD.width), mainCam)
    this.gameState.container.wodIndicators.big.x = wodIndicatorX;
    this.gameState.container.wodIndicators.small.x = wodIndicatorX;
  
    // Update position of player indicator
    const playerIndicatorX = this.getIndicatorX(this.gameState.player.x, mainCam)
    this.gameState.container.playerIndicator.x = playerIndicatorX;
    
    // Update position of caravan indicator
    const caravanIndicatorX = this.getIndicatorX(this.gameState.caravan.x, mainCam)
    this.gameState.container.caravanIndicator.x = caravanIndicatorX;
  }

  getIndicatorX(trackingObjectX, mainCam) {
    const indicatorProgress = 1 - (gameWidth - trackingObjectX) / gameWidth;
    const indicatorX = indicatorProgress * mainCam.width + 100;
    return indicatorX
  }

  checkWinLoseConditions() {
    // Lose if wall of death touches caravan
    if ((this.gameState.WoD.x + this.gameState.WoD.width) > this.gameState.caravan.x){
      this.loseGame()
    }
    // Lose if wall of death touches player
    if ((this.gameState.WoD.x + this.gameState.WoD.width) > this.gameState.player.x){
      this.loseGame()
    }
    // Win if caravan has reached end
    if (this.gameState.caravan.x >= this.gameState.winXPos){
      this.winLevel()
    }
  }

  loseGame() {
    Logger.DEBUG("Triggered loseGame()")
    //   this.scene.pause();
    this.gameState.gameRunning = false;
  
    let textPositionX = this.cameras.main.worldView.centerX
    let textPositionY = this.cameras.main.worldView.centerY;
    // let loseText = "Congratulations! You lost!"
    let loseText = "You lose! \nPress r to restart"
    this.add.text(textPositionX, textPositionY, loseText,{ font: '32px Arial',align: 'center' }).setOrigin(0.5, 0.5);
    //   this.scene.restart();
  }

  winLevel() {
    Logger.DEBUG("Triggered winLevel()")
    this.gameState.gameRunning = false;

    let textPositionX = this.cameras.main.worldView.centerX
    let textPositionY = this.cameras.main.worldView.centerY;
    // let winText = "Oh no! You won"
    let winText = "Congratulations! \nYou won"
  
    // Unlock next level
    let nextLevelName = `Level${this.level + 1}`
    let hasNextLevel = this.scene.manager.keys.hasOwnProperty(nextLevelName);

    if (unlockedLevels.includes(2) == false) {
      unlockedLevels.push(this.level + 1)
    }

    if (hasNextLevel) {
      winText += ` ${this.levelName}!\nNow on to ${nextLevelName}!`
      this.add.text(textPositionX, textPositionY, winText,{ font: '32px Arial',align: 'center' })
      this.time.addEvent({
          delay: 3000,
          loop: false,
          callback: () => {
            this.scene.start(nextLevelName);
          }
      });
    } else {
      winText += ` The Game!`
      this.add.text(textPositionX, textPositionY, winText,{ font: '32px Arial',align: 'center' })
      this.gameState.gameFinished = true
    }
  }

  // Methods that relate to player controls
  movePlayer() {
    /* Update player position */
  
    // Set velocity in X
    if (this.gameState.cursorKeys.right.isDown) {
      this.gameState.player.setVelocityX(speedX)
    } 
    if (this.gameState.cursorKeys.left.isDown) {
      this.gameState.player.setVelocityX(-speedX)
    }
    if (this.gameState.cursorKeys.right.isUp && this.gameState.cursorKeys.left.isUp) {
      this.gameState.player.setVelocityX(0)
    }
  
    // Set velocity in Y
    if (this.gameState.cursorKeys.down.isDown) {
      this.gameState.player.setVelocityY(speedY)
    }
    if (this.gameState.cursorKeys.up.isDown) {
      this.gameState.player.setVelocityY(-speedY)
    }
    if (this.gameState.cursorKeys.down.isUp && this.gameState.cursorKeys.up.isUp) {
      this.gameState.player.setVelocityY(0)
    }
  }

  addCaravanWaypoint(newPoint){
    // If newPoint is not explicitly passed in, add waypoint to current player position
    newPoint = newPoint || Point(this.gameState.player.x, this.gameState.player.y)
    // Add a waypoint to the caravan
    this.gameState.caravan.path.push(newPoint)
  
    let newPointImage = this.add.image(newPoint.x + 1, newPoint.y - 14, 'flag').setScale(0.25);
    this.gameState.caravan.waypoints.push(newPointImage);
  
    if (this.gameState.caravan.path.length > 1) {
      this.addCaravanWaypointLine(newPoint)
    }
  }

  caravanCalcPath() {
    const dx = this.gameState.caravan.path[0].x - this.gameState.caravan.x
    const dy = this.gameState.caravan.path[0].y - this.gameState.caravan.y
    
    // Get the angle of directional vector
    const curAngle = Math.atan2(dy,dx);
    // And the normalized direction
    this.gameState.caravan.moveX = Math.cos(curAngle)
    this.gameState.caravan.moveY = Math.sin(curAngle)
    
    // Rotate caravan to align with direction of movement
    this.gameState.caravan.rotation = Math.PI/2 + curAngle;
  }

  moveCaravan() {
    if ((this.gameState.frameCount % 10) === 0) {
      this.caravanCalcPath()
    }
    // Move the caravan in direction, with speed
    this.gameState.caravan.setVelocityX(this.gameState.caravan.moveX * this.gameState.caravan.moveSpeed)
    this.gameState.caravan.setVelocityY(this.gameState.caravan.moveY * this.gameState.caravan.moveSpeed)
  }

  moveWoD() {
    this.gameState.WoD.x += this.gameState.wallSpeed
    this.gameState.WoD2.x += this.gameState.wallSpeed
    this.gameState.WoD3.x += this.gameState.wallSpeed
    this.gameState.WoD4.x += this.gameState.wallSpeed
    // this.gameState.WoD.width += this.gameState.wallSpeed
  
    // this.gameState.WoD.emitter.x = this.gameState.WoD.x;
    // this.gameState.WoD.emitter.y = gameHeight*Math.random();
  
    // this.gameState.WoD.emitter.emitParticleAt(this.gameState.WoD.x + this.gameState.WoD.width, gameHeight * Math.random());
    // this.gameState.WoD.emitter.emitParticleAt(this.gameState.WoD.x+20,gameHeight*Math.random());
    // this.gameState.WoD.emitter.emitParticleAt(this.gameState.WoD.x+20,gameHeight*Math.random());
    // this.gameState.WoD.emitter.emitParticleAt(this.gameState.WoD.x+20,gameHeight*Math.random());
  }

  removeWaypointIfClose() {
    /* Check if caravan is close to first waypoint, and if it is, remove the waypoint */
    const dx = this.gameState.caravan.path[0].x - this.gameState.caravan.x
    const dy = this.gameState.caravan.path[0].y - this.gameState.caravan.y
    
    const minDist = 100// Minimum distance to move caravan
    // const minDist = this.gameState.caravan.moveSpeed // Minimum distance to move caravan
    // If caravan is close to the point
    if ((dx*dx + dy*dy) <= minDist) {
      this.gameState.caravan.setVelocityX(0)
      this.gameState.caravan.setVelocityY(0)
      
      // Remove a point
      this.removeCaravanFirstPoint()
    }
  }

  removeCaravanFirstPoint() {
    /* Remove the first point from the path list, the first waypoint from list of waypoints,
       and if one or more path lines exist, also remove the first one.
       
       If this action leaves the path list empty, remove curPathLine from the caravan,
       otherwise just update the curPathLine to point from the new "first" waipoint.
    */
    this.gameState.caravan.path.shift(0, 1);
    this.gameState.caravan.waypoints.shift(0, 1).destroy();
    this.gameState.caravan.pathLines.shift(0, 1)?.destroy();
  
    if (this.gameState.caravan.path.length === 0) {
      this.gameState.caravan.curPathLine?.destroy();
      delete this.gameState.caravan.curPathLine;
    } else {
      this.gameState.caravan.curPathLine.geom.x2 = this.gameState.caravan.path[0].x;
      this.gameState.caravan.curPathLine.geom.y2 = this.gameState.caravan.path[0].y;
    }
  }

  removeCaravanLastPoint(){
    /* Remove the latest added waypoint */
    if (this.gameState.caravan.path.length > 0) {
      this.gameState.caravan.path.pop();
      this.gameState.caravan.waypoints.pop().destroy();
      this.gameState.caravan.pathLines.pop()?.destroy();
    }
  
    // If there are no waypoints left, set the caravan velocity to 0
    // and delete the line from caravan to waypoint
    if (this.gameState.caravan.path.length === 0) {
      this.gameState.caravan.setVelocity(0,0);
      this.gameState.caravan.curPathLine?.destroy();
      delete this.gameState.caravan.curPathLine;
    }
  }

  drawCaravanWaypointLine() {
    /* If a line exists from caravan to waypoint, update the current line.
       If one doesn't exist, create a new line between the caravan and the 
       first waypoint. 
    */
    if (typeof this.gameState.caravan.curPathLine === "undefined") {
      const newLine = this.add.line(
        0, 0, 
        this.gameState.caravan.x, this.gameState.caravan.y, 
        this.gameState.caravan.path[0].x, this.gameState.caravan.path[0].y, 
        clrCaravan
      ).setOrigin(0,0).setLineWidth(0.5,0.5);
      this.gameState.caravan.curPathLine = newLine
  
    } else {
      this.gameState.caravan.curPathLine.geom.x1 = this.gameState.caravan.x;
      this.gameState.caravan.curPathLine.geom.y1 = this.gameState.caravan.y;
    }
  }

  addCaravanWaypointLine(newPoint) {
    /* Draw a line between the two latest waypoints */
    const prevPoint = this.gameState.caravan.path[this.gameState.caravan.path.length-2];
    const newLine = this.add.line(0, 0, prevPoint.x, prevPoint.y, newPoint.x, newPoint.y, clrCaravan).setOrigin(0,0).setLineWidth(0.5,0.5);
    this.gameState.caravan.pathLines.push(newLine);
  }

  drawVisionPlayer() {
    // Move the spotlight sprite to the player position
    this.gameState.spotlight.x = this.gameState.player.x;
    this.gameState.spotlight.y = this.gameState.player.y;
  }
} 
