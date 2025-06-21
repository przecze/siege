import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  preload() {
    // Load tile sprites
    this.load.image('wood', './assets/wood.png');
    this.load.image('steel', './assets/steel.png');
    this.load.image('magic', './assets/magic.png');
    this.load.image('fire', './assets/fire.png');
    
    // Load unit patterns data
    this.load.json('unitPatterns', './data/unitPatterns.json');
    
    // Load unit spritesheets for tutorial use
    this.load.spritesheet("infantry", "./assets/infantry.webp", {
      frameWidth: 77,
      frameHeight: 90,
    });
    this.load.spritesheet("rider", "./assets/rider.webp", {
      frameWidth: 77,
      frameHeight: 90,
    });
    
    // Load archer sprite (using first idle frame as default)
    this.load.image("archer", "assets/archer/ani_cropped/Idle_1.png");
  }

  create() {
    this.scene.start('menu');
  }
}
