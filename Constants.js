let Logger = new Log()
// const clrBackground = "0x81855e";
const clrBackground = "0xccae8d";
const clrPlayer = "0xff0000";
const clrFoW = '#fff6c7';
const clrCaravan = '0x0f0f0f';
// const clrWoD = '0xFF9060';
const clrWoD = '0x362a28;'
const clrProgressBar = '0x4a437a';
const clrButtonInactive = '0x7a6956';
const clrButtonActive = '0x83bf77';

const canvasWidth = 1200;
const canvasHeight = 800;
const gameWidth = 6400;
const gameHeight = 1600;
const progressBarWidth = 0.8  // Fraction of canvas width
const speedX = 200;
const speedY = speedX;

let flickerSize = 5;
let maxFlicker = 100;
let minFlicker = -50;

let gameFinished = false;
