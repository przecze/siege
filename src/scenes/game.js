import Phaser from "phaser";
import Grid from "../components/grid";
import UnitPatternAtlas from "../components/unitPatternAtlas";
import { Battlefield } from "../battlefield/Battlefield";
import HealthTracker from "../components/healthTracker";
import { KeyboardController } from "../input/KeyboardController";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("game");
    this.isPaused = false;
    window.b = this;
  }

  create(data) {
    let bg = this.add.image(0, 0, "background").setOrigin(0, 0);
    let scaleX = this.cameras.main.width / bg.width;
    let scaleY = this.cameras.main.height / bg.height;
    let scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);

    const cellSize = this.sys.game.config.height / 12;
    this.grid = new Grid(this, 0, 0, 5, 6, cellSize);
    this.grid.cellSize = cellSize;
    this.grid.setPosition(0, 0);
    this.grid.setScale(cellSize / 64);

    // Send troops button (mobile only)
    this.sendTroopsButton = this.add
      .text(
        cellSize * this.grid.scaleY * 0.5,
        cellSize * this.grid.scaleX * 5.3,
        "Send Troops",
        { color: "#0f0", backgroundColor: "#808080", padding: { x: 16, y: 12 } },
      )
      .setOrigin(0, 0)
      .setInteractive()
      .on("pointerdown", () => this.grid.resetGrid());

    this.sendTroopsButton.visible = !this.sys.game.device.os.desktop;

    // Player input — KeyboardController owns all grid key bindings
    this.controller = new KeyboardController(this);

    // Scene-level keys not part of player actions
    this.input.keyboard.on("keydown-S", this.slowGame, this);
    this.input.keyboard.on("keydown-P", this.togglePause, this);
    this.input.keyboard.on("keydown-T", () => { this.battlefield.timer = 5; });
    this.input.keyboard.on("keydown-MINUS", () => {
      this.difficulty = Math.max(1, this.difficulty - 1);
      this.healthTracker.updateDifficulty(this.difficulty);
      this.battlefield.updateDifficulty(this.difficulty);
    });
    this.input.keyboard.on("keydown-PLUS", () => {
      this.difficulty = Math.min(10, this.difficulty + 1);
      this.healthTracker.updateDifficulty(this.difficulty);
      this.battlefield.updateDifficulty(this.difficulty);
    });

    const atlasWidth = this.grid.cols * this.grid.cellSize * this.grid.scaleX * 2;
    const atlasHeight = this.grid.rows * this.grid.cellSize * this.grid.scaleY * 2;
    this.unitPatternAtlas = new UnitPatternAtlas(this, 0, 0, atlasWidth, atlasHeight);
    this.input.keyboard.on("keydown-V", () => {
      this.unitPatternAtlas.setVisible(true);
      this.grid.craftAreaBorder.setVisible(false);
    });
    this.input.keyboard.on("keyup-V", () => {
      this.unitPatternAtlas.setVisible(false);
      this.grid.craftAreaBorder.setVisible(true);
    });

    this.input.on("pointerdown", (pointer) => {
      console.log(pointer.x, pointer.y);
      const gridCoordinates = this.grid.getGridCoordinates(pointer.x, pointer.y);
      if (gridCoordinates) {
        this.grid.touchBlockXY(gridCoordinates.row, gridCoordinates.col);
      }
    });

    this.units = [];

    const unitPatterns = this.cache.json.get("unitPatterns");
    this.grid.patternMatcher.setPatterns(unitPatterns);
    this.grid.runPatternCheck();

    this.battlefield = new Battlefield(this);

    this.healthTracker = new HealthTracker(
      this,
      this.sys.game.config.width / 3,
      0,
      this.battlefield.playerHealth,
      this.battlefield.enemyCastle.health,
      1000,
    );

    this.difficulty = data.difficulty || 5;
    this.battlefield.updateDifficulty(this.difficulty);
    this.healthTracker.updateDifficulty(this.difficulty);

    this.endText = this.add
      .text(
        this.sys.game.config.width / 2,
        this.sys.game.config.height / 2,
        "",
        { fontSize: "32px", backgroundColor: "0xffD700", align: "center" },
      )
      .setOrigin(0.5, 0.5)
      .setVisible(false);
  }

  slowGame() {
    this.physics.world.timeScale *= 0.5;
  }

  togglePause() {
    if (this.isPaused) {
      this.physics.resume();
    } else {
      this.physics.pause();
    }
    this.isPaused = !this.isPaused;
  }

  update() {
    if (this.battlefield.gameOver) {
      let endMessage;
      if (this.battlefield.enemyCastle.health <= 0) {
        endMessage = "You win! Enemy castle is destroyed.";
      } else if (this.battlefield.playerHealth <= 0) {
        endMessage = "You lose! Your castle is destroyed.";
      } else {
        endMessage = "Time's up!";
      }
      endMessage += "\nPress 'R' to restart the game.";
      this.endText.setText(endMessage).setVisible(true);

      this.input.keyboard.once("keydown-R", () => {
        this.scene.restart({ difficulty: this.difficulty });
      });
    } else {
      if (!this.isPaused && !this.battlefield.gameOver) {
        // Poll controller and apply player actions to the grid
        const actions = this.controller.getActions();
        if (actions.moveCursor) this.grid.moveCursor(actions.moveCursor.dx, actions.moveCursor.dy);
        if (actions.confirmSwap) this.grid.swapBlocks();
        if (actions.sendTroops) this.grid.resetGrid();

        this.battlefield.update();
        this.healthTracker.updatePlayerHealth(this.battlefield.playerHealth);
        this.healthTracker.updateEnemyHealth(this.battlefield.enemyCastle.health);

        const minutes = Math.floor(this.battlefield.timer / 60);
        const seconds = Math.floor(this.battlefield.timer % 60);
        const timerText = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
        this.healthTracker.updateTimer(timerText);
      }
    }
  }
}
