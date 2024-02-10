import Phaser from 'phaser';
import Infantry from '../units/infantry';
import Rider from '../units/rider';
import Arrow from '../units/archer';	

export default class Battlefield {
  constructor(scene) {
    this.scene = scene;
    this.units = [];
    this.enemyCastle = {
      x: scene.sys.game.config.width - 50, // Position of the enemy castle on the right side of the screen
      health: 1000, // Set the initial health of the enemy castle
    };
    this.playerCastle = {
      x: 50, // Assuming left side of the screen
      y: scene.sys.game.config.height - 100, // You might need to adjust this
    };
    this.playerHealth = 1000;
    this.spawnEnemyTimer = scene.time.addEvent({
      delay: 3200,
      callback: this.spawnEnemyUnit,
      callbackScope: this,
      loop: true,
    });
    this.spawnArrowTimer = scene.time.addEvent({
        delay: 1000,
        callback: this.spawnArrowEvent,
        callbackScope: this,
        loop: true,
    });
    this.timer = 100;
  }

  spawnArrowEvent() {
    this.spawnUnit('arrow', 'L');
  }
  spawnEnemyUnit() {
    let unitType;
    let rand = Math.random(); // generates a random number between 0 and 1
    
    if (rand < 0.2) {
      unitType = 'rider';
    } else {
      unitType = 'infantry';
    }
    
    this.spawnUnit(unitType, 'R');
  }


  spawnUnit(unitType, player) {
    const startPosition = {
      x: Math.floor(Math.random()*30),
      y: this.scene.sys.game.config.height * 5 / 6, };
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
      case 'arrow':
        unit = new Arrow(this.scene, startPosition.x, startPosition.y, player);
        break;
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

    // Check for collisions between units and handle combat
    this.handleCombat();

    // Update the position of units and handle other unit logic here
    this.units.forEach((unit) => {
      unit.update();
    });

    // Check if any units reached the enemy castle and deal damage
    this.units.forEach((unit) => {
      if (unit.player == 'L' && unit.x >= this.enemyCastle.x - 10) {
        this.enemyCastle.health -= unit.health; // Reduce the castle's health by the unit's attack power
        unit.destroy(); // Destroy the unit after it deals damage to the castle
        console.log(this.enemyCastle.health);
      }
      if (unit.player == 'R' && unit.x <= 10) {
        this.playerHealth -= unit.health; // Reduce the castle's health by the unit's attack power
        unit.destroy(); // Destroy the unit after it deals damage to the castle
        console.log(this.playerHealth);
      }
    });

    // Remove destroyed units from the array
    this.units = this.units.filter((unit) => !unit.destroyed);

    this.timer = Math.max(this.timer - this.scene.game.loop.delta / 1000, 0); // Subtract elapsed time (in seconds) from timer
    this.gameOver = false;
    if (this.enemyCastle.health <= 0) {
      this.gameOver = true;
    }
    if (this.playerHealth <= 0) {
      this.gameOver = true;
    }
    if (this.timer <= 0) {
      this.gameOver = true;
    }


  }
}

