import Phaser from 'phaser';

export default class HealthTracker extends Phaser.GameObjects.Container {
  constructor(scene, x, y, playerHealth, enemyHealth, timer) {
    super(scene, x, y);

    // Create text objects for player health, enemy health, and timer
    this.playerHealthText = new Phaser.GameObjects.Text(scene, 0, 0, `Player Health: ${playerHealth}`, { color: '#00ff00', align: 'center' });
    this.enemyHealthText = new Phaser.GameObjects.Text(scene, 0, 50, `Enemy Health: ${enemyHealth}`, { color: '#ff0000', align: 'center' });
    this.timerText = new Phaser.GameObjects.Text(scene, 0, 25, `Timer: ${timer}`, { color: '#ffffff', align: 'center' });

    // Add text objects to the container
    this.add(this.playerHealthText);
    this.add(this.enemyHealthText);
    this.add(this.timerText);

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

