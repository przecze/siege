import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  preload() {
    // Load tile sprites
    this.load.image('wood', './assets/units/wood.png');
    this.load.image('steel', './assets/units/steel.png');
    this.load.image('magic', './assets/units/magic.png');
    this.load.image('fire', './assets/units/fire.png');
    
    // Load unit patterns data
    this.load.json('unitPatterns', './data/unitPatterns.json');
    
    // Unit spritesheets for tutorial — loaded as Aseprite atlases
    this.load.aseprite("soldier", "./assets/units/soldier.png", "./assets/units/soldier.json");
    this.load.aseprite("lancer", "./assets/units/lancer.png", "./assets/units/lancer.json");
    this.load.aseprite("archer", "./assets/units/archer.png", "./assets/units/archer.json");
  }

  create() {
    this.scene.start('menu');
  }
}
