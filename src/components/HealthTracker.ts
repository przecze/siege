import Phaser from 'phaser';

export class HealthTracker extends Phaser.GameObjects.Container {
  private playerHealthText: Phaser.GameObjects.Text;
  private enemyHealthText: Phaser.GameObjects.Text;
  private timerText: Phaser.GameObjects.Text;
  private currentDifficultyText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, playerHealth: number, enemyHealth: number, timer: number) {
    super(scene, x, y);

    let yOffset = 0;
    const bigFont = '24px';
    const smallFont = '16px';

    this.playerHealthText = new Phaser.GameObjects.Text(scene, 0, yOffset, `Player Health: ${playerHealth}`, {
      color: '#00ff00', align: 'center', backgroundColor: '#000000', fontSize: bigFont,
    });
    yOffset += this.playerHealthText.height;

    this.enemyHealthText = new Phaser.GameObjects.Text(scene, 0, yOffset, `Enemy Health: ${enemyHealth}`, {
      color: '#ff0000', align: 'center', backgroundColor: '#000000', fontSize: bigFont,
    });
    yOffset += this.enemyHealthText.height;

    this.timerText = new Phaser.GameObjects.Text(scene, 0, yOffset, `Timer: ${timer}`, {
      color: '#ffffff', align: 'center', fontSize: bigFont,
    });
    yOffset += this.timerText.height;

    const instructions =
      'Use the arrow keys and spacebar to build patterns ' +
      "\nPress 'r' to release your units" +
      "\nPress 'p' to pause" +
      "\nHold 'v' to show available unit patterns" +
      "\nPress -/+ to adjust the difficulty" +
      '\n(enemy unit spawn rate)';
    const instructionsText = new Phaser.GameObjects.Text(scene, 0, yOffset, instructions, {
      color: '#ffffff', align: 'left', fontSize: smallFont,
    });
    yOffset += instructionsText.height;

    this.currentDifficultyText = new Phaser.GameObjects.Text(scene, 0, yOffset, `Current Difficulty: ${(scene as Phaser.Scene & { difficulty?: number }).difficulty ?? ''}`, {
      color: '#ffffff', align: 'left', backgroundColor: '#000000', fontSize: bigFont,
    });

    this.add([this.playerHealthText, this.enemyHealthText, this.timerText, instructionsText, this.currentDifficultyText]);
    scene.add.existing(this);
  }

  updatePlayerHealth(value: number): void { this.playerHealthText.setText(`Player Health: ${value}`); }
  updateEnemyHealth(value: number): void   { this.enemyHealthText.setText(`Enemy Health: ${value}`); }
  updateDifficulty(value: number): void    { this.currentDifficultyText.setText(`Current Difficulty: ${value}`); }
  updateTimer(value: string): void         { this.timerText.setText(`Timer: ${value}`); }
}
