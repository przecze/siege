import Phaser from "phaser";
import Grid from "../components/grid";
import UnitPatternAtlas from "../components/unitPatternAtlas";
import Battlefield from "../components/battlefield";
import HealthTracker from "../components/healthTracker";

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
        {
          color: "#0f0",
          backgroundColor: "#808080",
          padding: { x: 16, y: 12 },
        },
      )
      .setOrigin(0, 0)
      .setInteractive()
      .on("pointerdown", () => this.grid.resetGrid());

    this.sendTroopsButton.visible = !this.sys.game.device.os.desktop;

    this.cursors = this.input.keyboard.createCursorKeys();

    this.cursors.left.on("down", () => {
      this.grid.moveCursor(-1, 0);
    });

    this.cursors.right.on("down", () => {
      this.grid.moveCursor(1, 0);
    });

    this.cursors.up.on("down", () => {
      this.grid.moveCursor(0, -1);
    });

    this.cursors.down.on("down", () => {
      this.grid.moveCursor(0, 1);
    });

    this.input.keyboard.on("keydown-SPACE", () => {
      this.grid.swapBlocks();
    });
    this.input.keyboard.on("keydown-R", () => {
      this.grid.resetGrid();
    });
    this.input.keyboard.on("keydown-S", this.slowGame, this);
    this.input.keyboard.on("keydown-P", this.togglePause, this);

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

    const atlasWidth =
      this.grid.cols * this.grid.cellSize * this.grid.scaleX * 2;
    const atlasHeight =
      this.grid.rows * this.grid.cellSize * this.grid.scaleY * 2;
    this.unitPatternAtlas = new UnitPatternAtlas(
      this,
      0,
      0,
      atlasWidth,
      atlasHeight,
    );
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
      const gridCoordinates = this.grid.getGridCoordinates(
        pointer.x,
        pointer.y,
      );
      // only call touchBlockXY if the coordinates are inside the grid
      if (gridCoordinates) {
        this.grid.touchBlockXY(gridCoordinates.row, gridCoordinates.col);
      }
    });

    this.units = [];

    // Create animations from Aseprite atlas data
    this.anims.createFromAseprite("soldier");
    this.anims.createFromAseprite("lancer");
    this.anims.createFromAseprite("archer");

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
        {
          fontSize: "32px",
          backgroundColor: "0xffD700",
          align: "center",
        },
      )
      .setOrigin(0.5, 0.5)
      .setVisible(false);
  }

  slowGame() {
    // Modify the timeScale to slow down the game
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

  preload() {
    this.load.image("background", "./assets/background.png");
    this.load.image("arrow", "./assets/units/arrow.png");

    // Unit spritesheets — loaded as Aseprite atlases
    this.load.aseprite("soldier", "./assets/units/soldier.png", "./assets/units/soldier.json");
    this.load.aseprite("lancer", "./assets/units/lancer.png", "./assets/units/lancer.json");
    this.load.aseprite("archer", "./assets/units/archer.png", "./assets/units/archer.json");
  }

  update() {
    if (this.battlefield.gameOver) {
      // Show end screen
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

      // Listen for 'R' to restart the game
      this.input.keyboard.once("keydown-R", () => {
        this.scene.restart({ difficulty: this.difficulty });
      });
    } else {
      if (!this.isPaused && !this.battlefield.gameOver) {
        // Continue the game...
        this.battlefield.update();
        this.healthTracker.updatePlayerHealth(this.battlefield.playerHealth);
        this.healthTracker.updateEnemyHealth(
          this.battlefield.enemyCastle.health,
        );

        const minutes = Math.floor(this.battlefield.timer / 60);
        const seconds = Math.floor(this.battlefield.timer % 60);
        const timerText = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
        this.healthTracker.updateTimer(timerText);
      }
    }
  }
}
