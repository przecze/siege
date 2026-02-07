import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  preload() {
    // Load element tile atlas (wood, steel, magic, fire)
    this.load.atlas('elements', './assets/units/elements.png', './assets/units/elements.json');
    
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
