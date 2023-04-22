import Phaser from 'phaser';
import Infantry from '../units/infantry';

export default class Battlefield {
  constructor(scene) {
    this.scene = scene;
    this.units = [];
  }

  spawnUnit(unitType) {
    const startPosition = {
      x: 0, // Modify this value to set the desired spawn position on the left side of the screen
      y: this.scene.sys.game.config.height / 2,
    };

    let unit;

    switch (unitType) {
      case 'infantry':
        unit = new Infantry(this.scene, startPosition.x, startPosition.y);
        break;
      // Add more cases for other unit types as needed
      default:
        console.warn(`Unknown unit type: ${unitType}`);
        return;
    }

    this.units.push(unit);
  }

  update() {
    // Update the position of units and handle other unit logic here
    this.units.forEach((unit) => {
      unit.update();
    });
  }
}
