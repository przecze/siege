import Phaser from 'phaser';
import Infantry from '../units/infantry';
import Rider from '../units/rider';
import Arrow from '../units/arrow';	
import Archer from '../units/archer';


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
      delay: 3000,
      callback: this.spawnEnemyUnit,
      callbackScope: this,
      loop: true,
    });
    this.timer = 100;
  }

  spawnEnemyUnit() {
    // Don't spawn new enemies if the game is over
    if (this.gameOver) {
      return;
    }
    
    let unitType;
    let rand = Math.random(); // generates a random number between 0 and 1
    
    if (rand < 0.2) {
      unitType = 'lancer';
      this.spawnUnit(Rider, 'R');
    } else if (rand < 0.7) {
      this.spawnUnit(Infantry, 'R');
    } else {
      this.spawnUnit(Archer, 'R');
    }
  }

	updateDifficulty(difficulty) {
		this.spawnEnemyTimer.delay = 5000 - 300 * difficulty;
	}

  spawnArrow(x, player) {
    const y = this.scene.sys.game.config.height * 5 / 6;
    this.spawnUnit(Arrow, player, x, y);
  }

  spawnUnit(unitType, player, x, y) {
    if (x === undefined) {
        x = (player === 'L') ?
                    Math.floor(Math.random() * 30)
                    : this.enemyCastle.x - Math.floor(Math.random() * 30);
    }
    y = y || this.scene.sys.game.config.height * 5 / 6;
    const startPosition = { x, y };
  
    let UnitClass;
    if (typeof unitType === 'string') {
      // Map the string-based unit type to the corresponding class
      const unitClasses = {
        'soldier': Infantry,
        'lancer': Rider,
        'arrow': Arrow,
        'archer': Archer,
      };
      UnitClass = unitClasses[unitType.toLowerCase()];
    } else {
      // If a class is passed directly, use it
      UnitClass = unitType;
    }
  
    if (!UnitClass) {
      console.error(`Unknown unit type: ${unitType}`);
      return;
    }
  
    // Create a new instance of the unit and add it to the battlefield
    const unit = new UnitClass(this.scene, startPosition.x, startPosition.y, player);
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
      }
      if (unit.player == 'R' && unit.x <= 10) {
        this.playerHealth -= unit.health; // Reduce the castle's health by the unit's attack power
        unit.destroy(); // Destroy the unit after it deals damage to the castle
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

    // Stop enemy spawning when game is over
    if (this.gameOver && this.spawnEnemyTimer) {
      this.spawnEnemyTimer.remove();
      this.spawnEnemyTimer = null;
    }


  }
}

