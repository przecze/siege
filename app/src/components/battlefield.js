import Phaser from 'phaser';
import Infantry from '../units/infantry';
import Rider from '../units/rider';

export default class Battlefield {
  constructor(scene) {
    this.scene = scene;
    this.units = [];
    this.enemyCastle = {
      x: scene.sys.game.config.width - 50, // Position of the enemy castle on the right side of the screen
      health: 1000, // Set the initial health of the enemy castle
    };
    this.spawnEnemyTimer = scene.time.addEvent({
      delay: 6000,
      callback: this.spawnEnemyUnit,
      callbackScope: this,
      loop: true,
    });
  }

  spawnEnemyUnit() {
    this.spawnUnit('infantry', 'R');
  }


  spawnUnit(unitType, player) {
    const startPosition = {
      x: 0,
      y: this.scene.sys.game.config.height / 2,
    };
    if (player == 'R') {
      startPosition.x = this.enemyCastle.x - 20;
    }
    let unit;
    switch (unitType) {
      case 'infantry':
        unit = new Infantry(this.scene, startPosition.x, startPosition.y, player);
        break;
      case 'rider':
        unit = new Rider(this.scene, startPosition.x, startPosition.y, player);
        break;
      // Add more cases for other unit types as needed
      default:
        console.warn(`Unknown unit type: ${unitType}`);
        return;
    } 
    this.units.push(unit);
  }


  handleCombat() {
    for (let i = 0; i < this.units.length; i++) {
      for (let j = i + 1; j < this.units.length; j++) {
        if ((this.units[i].player != this.units[j].player) &&
            Phaser.Geom.Intersects.RectangleToRectangle(
              this.units[i].getBounds(),
              this.units[j].getBounds())) {
          // Units are colliding, handle combat here
          const unit1 = this.units[i];
          const unit2 = this.units[j];
          unit1.isEngaged = true;
          unit2.isEngaged = true;

          // Deal damage to each other based on their attack power
          unit1.takeDamage(unit2.attackPower);
          unit2.takeDamage(unit1.attackPower);

          // Remove dead units from the battlefield
          if (unit1.isDead()) {
            unit1.destroy();
            unit2.isEngaged = false;
            this.units.splice(i, 1);
            i--; // Decrement i to maintain the correct index after removing the unit
            if (unit2.isDead()) { // Check if unit2 is also dead
              unit2.destroy();
              this.units.splice(j - 1, 1);
            }
            break;
          }

          if (unit2.isDead()) {
            unit2.destroy();
            unit1.isEngaged = false;
            this.units.splice(j, 1);
            j--; // Decrement j to maintain the correct index after removing the unit
          }
        }
      }
    }
  }


  update() {
    // Update the position of units and handle other unit logic here
    this.units.forEach((unit) => {
      unit.update();
    });

    // Check for collisions between units and handle combat
    this.handleCombat();

    // Check if any units reached the enemy castle and deal damage
    this.units.forEach((unit) => {
      if (unit.x >= this.enemyCastle.x - 10) {
        this.enemyCastle.health -= unit.health; // Reduce the castle's health by the unit's attack power
        unit.destroy(); // Destroy the unit after it deals damage to the castle
        console.log(this.enemyCastle.health)
      }
    });

    // Remove destroyed units from the array
    this.units = this.units.filter((unit) => !unit.destroyed);

    // Check if the enemy castle is destroyed
    if (this.enemyCastle.health <= 0) {
      console.log('You win! Enemy castle is destroyed.');
      // Handle the win condition here, e.g., end the game or transition to the next level
    }
  }
}

