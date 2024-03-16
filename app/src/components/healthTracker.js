import Phaser from "phaser";

export default class HealthTracker extends Phaser.GameObjects.Container {
  constructor(scene, x, y, playerHealth, enemyHealth, timer) {
    super(scene, x, y);

    // Create text objects for player health, enemy health, and timer
    let yOffset = 0;
    const bigFont = "24px";
    const smallFont = "16px";
    this.playerHealthText = new Phaser.GameObjects.Text(
      scene,
      0,
      yOffset,
      `Player Health: ${playerHealth}`,
      {
        color: "#00ff00",
        align: "center",
        backgroundColor: "#000000",
        fontSize: bigFont,
      },
    );
    yOffset += this.playerHealthText.height;
    this.enemyHealthText = new Phaser.GameObjects.Text(
      scene,
      0,
      yOffset,
      `Enemy Health: ${enemyHealth}`,
      {
        color: "#ff0000",
        align: "center",
        backgroundColor: "#000000",
        fontSize: bigFont,
      },
    );
    yOffset += this.enemyHealthText.height;
    this.timerText = new Phaser.GameObjects.Text(
      scene,
      0,
      yOffset,
      `Timer: ${timer}`,
      { color: "#ffffff", align: "center", fontSize: bigFont },
    );
    yOffset += this.timerText.height;
    let instructions = "Use the arrow keys and spacebar to build patterns ";
    instructions += "\nPress 'r' to release your units";
    instructions += "\nPress 'p' to pause";
    instructions += "\nHold 'v' to show available unit patterns";
    instructions += "\nPress -/+ to adjust the difficulty";
    instructions += "\n(enemy unit spawn rate)";
    this.instructionsText = new Phaser.GameObjects.Text(
      scene,
      0,
      yOffset,
      instructions,
      { color: "#ffffff", align: "left", fontSize: smallFont },
    );
    yOffset += this.instructionsText.height;

    this.currentDifficultyText = new Phaser.GameObjects.Text(
      scene,
      0,
      yOffset,
      `Current Difficulty: ${scene.difficulty}`,
      {
        color: "#ffffff",
        align: "left",
        backgroundColor: "#000000",
        fontSize: bigFont,
      },
    );

    // Add text objects to the container
    this.add(this.playerHealthText);
    this.add(this.enemyHealthText);
    this.add(this.timerText);
    this.add(this.instructionsText);
    this.add(this.currentDifficultyText);

    scene.add.existing(this);
  }

  updatePlayerHealth(playerHealth) {
    this.playerHealthText.setText(`Player Health: ${playerHealth}`);
  }

  updateEnemyHealth(enemyHealth) {
    this.enemyHealthText.setText(`Enemy Health: ${enemyHealth}`);
  }

  updateDifficulty(difficulty) {
    this.currentDifficultyText.setText(`Current Difficulty: ${difficulty}`);
  }

  updateTimer(timer) {
    this.timerText.setText(`Timer: ${timer}`);
  }
}
