class MainMenu extends Phaser.Scene {
    constructor () {
        super('MainMenu');
        this.btn1;
        this.btn2;
        this.btn3;
        this.scoreText1;
        this.scoreText2;
        this.scoreText3;
    }
  
    preload() {
      loadImage(this, 'player', 'elementDiamond.png');
      loadImage(this, 'caravan', 'arrowSmall.png');
      this.load.image('backgroundPaper', 'assets/cartographypack/Textures/parchmentBasic.png')
    }
  
    startLevel(level){
      const levelName = `Level${level}`;
      this.scene.start(levelName);
    }
    create(data) {
      let currentScene = this;
      // let centerX = this.cameras.main.worldView.centerX;
      // let centerY = this.cameras.main.worldView.centerY;
      let centerX = canvasWidth/2;
      let centerY = canvasHeight/2;

      let backSize = 1024
      this.add.image(centerX,centerY, 'backgroundPaper').setOrigin(0.5,0.5);
      
      let clrText = '0xffffff';
      let styleText = { font: '36px Arial', align: 'center' };
      let styleTextSmall = { font: '24px Arial', align: 'center' };
      let styleTextTiny = { font: '16px Arial', align: 'center' };
      let styleTextTitle = { font: '64px Arial', align: 'center', color: 'red'};

      this.add.text(centerX, centerY/4, 'FireFlight', styleTextTitle).setFontStyle('italic').setOrigin(0.5,0.5);

      this.add.text(centerX, 3*centerY/8, 'Made in 72 hours during Ludum Dare 48',styleTextSmall).setColor(clrText).setOrigin(0.5,0.5);

      let txtTop = 3*canvasHeight/5;
      let txtTop2 = txtTop;
      let txtLeft = canvasWidth*0.25;
      let txtLeft2 = canvasWidth*0.75;

      this.add.text(txtLeft, txtTop,
        "The forest fire is spreading!\n\n\nEscape the fire\nby guiding your caravan\nDEEPER AND DEEPER\ninto the forest\nby placing waypoints\n\nDon't let the caravan touch the\nburning wall of death"
        ,styleTextSmall
        ).setColor(clrText).setOrigin(0.5,0.5)
        
      this.add.text(txtLeft2, txtTop2,
        "Arrow keys to move\n\nSpace to drop waypoint\n\n Ctrl to remove \nlast dropped waypoint \n\n\nR to restart \n\nP to pause\n\nM to return to menu"
        ,styleTextSmall
        ).setColor(clrText).setOrigin(0.5,0.5)

      let btnW = canvasWidth/6;
      let btnH = btnW/2;
      let btnDist = btnH*1.5;
      let btnTop = 3.5*canvasHeight/8;
      let btnLeft = centerX;

      let btnPlayBack1 = this.add.rectangle(0,0,btnW,btnH,clrButtonActive).setOrigin(0.5,0.5).setInteractive();
      let btnPlayBack2 = this.add.rectangle(0,0,btnW,btnH,clrButtonInactive).setOrigin(0.5,0.5).setInteractive();
      let btnPlayBack3 = this.add.rectangle(0,0,btnW,btnH,clrButtonInactive).setOrigin(0.5,0.5).setInteractive();
      let btnPlayText1 = this.add.text(0,0,'Level 1',styleText).setOrigin(0.5,0.5);
      let btnPlayText2 = this.add.text(0,0,'Level 2',styleText).setOrigin(0.5,0.5);
      let btnPlayText3 = this.add.text(0,0,'Level 3',styleText).setOrigin(0.5,0.5);
      let btnPlayTextScore1 = this.add.text(0,btnH/3,'Best score: '+bestScores[0],styleTextTiny).setOrigin(0.5,0.5);
      let btnPlayTextScore2 = this.add.text(0,btnH/3,'Best score: '+bestScores[1],styleTextTiny).setOrigin(0.5,0.5);
      let btnPlayTextScore3 = this.add.text(0,btnH/3,'Best score: '+bestScores[2],styleTextTiny).setOrigin(0.5,0.5);

      this.btn1 = btnPlayBack1;
      this.btn2 = btnPlayBack2;
      this.btn3 = btnPlayBack3;
      this.scoreText1 = btnPlayTextScore1;
      this.scoreText2 = btnPlayTextScore2;
      this.scoreText3 = btnPlayTextScore3;
      
      this.scoreText1.setVisible(false);
      this.scoreText2.setVisible(false);
      this.scoreText3.setVisible(false);

      let btnPlay1 = this.add.container(btnLeft,btnTop,[btnPlayBack1,btnPlayText1,btnPlayTextScore1]);
      let btnPlay2 = this.add.container(btnLeft,btnTop + btnDist,[btnPlayBack2,btnPlayText2,btnPlayTextScore2]);
      let btnPlay3 = this.add.container(btnLeft,btnTop + 2 * btnDist,[btnPlayBack3,btnPlayText3,btnPlayTextScore3]);

      btnPlayBack1.on('pointerdown', function () {
        currentScene.startLevel(1)
      });
      btnPlayBack2.on('pointerdown', function () {
        if (levelsUnlocked.includes(2)) {
          currentScene.startLevel(2)
        } else {
          currentScene.cameras.main.shake(100,0.005);
        }
      });
      btnPlayBack3.on('pointerdown', function () {
        if (levelsUnlocked.includes(3)) {
        currentScene.startLevel(3)
        } else {
          currentScene.cameras.main.shake(100,0.005);
        }
      });
      



    }
  
    update(time, delta) {

      if (levelsCompleted.includes(1)) {
        this.scoreText1.setVisible(true);
      }
      if (levelsCompleted.includes(2)) {
        this.scoreText2.setVisible(true);
      }
      if (levelsCompleted.includes(3)) {
        this.scoreText3.setVisible(true);
      }


      if (levelsUnlocked.includes(2)) {
        this.btn2.setFillStyle(clrButtonActive);
      }
      if (levelsUnlocked.includes(3)) {
        this.btn3.setFillStyle(clrButtonActive);
      }
      
    }

    
  }
