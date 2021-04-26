class MainMenu extends Phaser.Scene {
    constructor () {
        super('MainMenu');
        this.btn1;
        this.btn2;
        this.btn3;
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
      let styleText = { font: '36px Arial',align: 'center' };
      let styleTextSmall = { font: '24px Arial',align: 'center' };
      let styleTextTitle = { font: '64px Arial',align: 'center' };

      this.add.text(centerX, centerY/4, 'Deeper and deeper into the forest',styleTextTitle).setColor(clrText).setOrigin(0.5,0.5);

      this.add.text(centerX, 3*centerY/8, 'Made in 72 hours during Ludum Dare 48',styleTextSmall).setColor(clrText).setOrigin(0.5,0.5);

      let btnW = canvasWidth/6;
      let btnH = btnW/2;
      let btnDist = btnH*1.5;
      let btnTop = 3.5*canvasHeight/8;
      let btnLeft = centerX;
      // let clrButton = '0xFF0000'

      // var btnPlayBack = this.add.rectangle(0,0,btnW,btnH,clrButton).setOrigin(0.5,0.5).setInteractive();
      // var btnPlayText = this.add.text(0,0,'Play',styleText).setOrigin(0.5,0.5)

      // var btnPlay = this.add.container(btnLeft,btnTop,[btnPlayBack,btnPlayText]);

      // btnPlayBack.on('pointerdown', function () {
      //   currentScene.startLevel(1)
      // });
      

      let btnPlayBack1 = this.add.rectangle(0,0,btnW,btnH,clrButtonActive).setOrigin(0.5,0.5).setInteractive();
      let btnPlayBack2 = this.add.rectangle(0,0,btnW,btnH,clrButtonInactive).setOrigin(0.5,0.5).setInteractive();
      let btnPlayBack3 = this.add.rectangle(0,0,btnW,btnH,clrButtonInactive).setOrigin(0.5,0.5).setInteractive();
      let btnPlayText1 = this.add.text(0,0,'Level 1',styleText).setOrigin(0.5,0.5);
      let btnPlayText2 = this.add.text(0,0,'Level 2',styleText).setOrigin(0.5,0.5);
      let btnPlayText3 = this.add.text(0,0,'Level 3',styleText).setOrigin(0.5,0.5);

      this.btn1 = btnPlayBack1;
      this.btn2 = btnPlayBack2;
      this.btn3 = btnPlayBack3;

      let btnPlay1 = this.add.container(btnLeft,btnTop,[btnPlayBack1,btnPlayText1]);
      let btnPlay2 = this.add.container(btnLeft,btnTop + btnDist,[btnPlayBack2,btnPlayText2]);
      let btnPlay3 = this.add.container(btnLeft,btnTop + 2 * btnDist,[btnPlayBack3,btnPlayText3]);

      btnPlayBack1.on('pointerdown', function () {
        currentScene.startLevel(1)
      });
      btnPlayBack2.on('pointerdown', function () {
        if (unlockedLevels.includes(2)) {
          currentScene.startLevel(2)
        } else {
          currentScene.cameras.main.shake(100,0.005);
        }
      });
      btnPlayBack3.on('pointerdown', function () {
        if (unlockedLevels.includes(3)) {
        currentScene.startLevel(3)
        } else {
          currentScene.cameras.main.shake(100,0.005);
        }
      });
      



    }
  
    update(time, delta) {
      if (unlockedLevels.includes(2)) {
        this.btn2.setFillStyle(clrButtonActive);
      }
      if (unlockedLevels.includes(3)) {
        this.btn3.setFillStyle(clrButtonActive);
      }
      
    }

    
  }
