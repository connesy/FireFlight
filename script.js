const Level1 = new Level(1);
const Level2 = new Level(2);
const Level3 = new Level(3);


// class testScene extends Phaser.Scene {
//   constructor ()
//     {
//         super('testScene');
//     }

//     create ()
//     {
//       console.log('wat')
//       this.scene.start('Level3')

//     }
// }

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
    Level1,
    Level2,
    Level3
  ]
}

const game = new Phaser.Game(config);



// console.log(game)

// game.scene.add('Level3',Level3);