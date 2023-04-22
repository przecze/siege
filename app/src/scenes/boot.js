import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  
  // ... (rest of the code)

  preload() {
    // Load your game assets here
    this.load.image('wood', './assets/wood.png');
    this.load.image('steel', './assets/steel.png');
    this.load.image('magic', './assets/magic.png');
    this.load.image('fire', './assets/fire.png');
    this.load.image('infantry', './assets/infantry.png');
    this.load.json('unitPatterns', './data/unitPatterns.json');
  }

  // ... (rest of the code)


  create() {
    this.scene.start('menu');
  }
}
