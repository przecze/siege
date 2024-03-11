import Phaser from 'phaser';

export default class HealthTracker extends Phaser.GameObjects.Container {
  constructor(scene, x, y, playerHealth, enemyHealth, timer) {
    super(scene, x, y);

    // Create text objects for player health, enemy health, and timer
    this.playerHealthText = new Phaser.GameObjects.Text(scene, 0, 0, `Player Health: ${playerHealth}`, { color: '#00ff00', align: 'center' });
    this.enemyHealthText = new Phaser.GameObjects.Text(scene, 0, 50, `Enemy Health: ${enemyHealth}`, { color: '#ff0000', align: 'center' });
    this.timerText = new Phaser.GameObjects.Text(scene, 0, 25, `Timer: ${timer}`, { color: '#ffffff', align: 'center' });
    let instructions = "Use the arrow keys and spacebar to build patterns ";
    instructions += "\nPress 'r' to release your units";
    instructions += "\nPress 'p' to pause";
    instructions += "\nHold 'v' to show available unit patterns";
    this.instructionsText = new Phaser.GameObjects.Text(scene, 0, 75, instructions, { color: '#ffffff', align: 'left' });
	

    // Add text objects to the container
    this.add(this.playerHealthText);
    this.add(this.enemyHealthText);
    this.add(this.timerText);
    this.add(this.instructionsText);

    scene.add.existing(this);
  }

  updatePlayerHealth(playerHealth) {
    this.playerHealthText.setText(`Player Health: ${playerHealth}`);
  }

  updateEnemyHealth(enemyHealth) {
    this.enemyHealthText.setText(`Enemy Health: ${enemyHealth}`);
  }

  updateTimer(timer) {
    this.timerText.setText(`Timer: ${timer}`);
  }
}

