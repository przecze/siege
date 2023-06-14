import Phaser from 'phaser';
import Grid from '../components/grid';
import Battlefield from '../components/battlefield';
import HealthTracker from '../components/healthTracker';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('game');
    this.isPaused = false;
  }

  create() {
    window.b = this
    const cellSize = Math.min(this.sys.game.config.width / 12, this.sys.game.config.height / 15);
    this.grid = new Grid(this, 0, 0, 5, 6, cellSize);
    this.grid.cellSize = cellSize;
    this.grid.setPosition(0, 0);
    this.grid.setScale(cellSize / 64);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.cursors.left.on('down', () => {
      this.grid.moveCursor(-1, 0);
    });

    this.cursors.right.on('down', () => {
      this.grid.moveCursor(1, 0);
    });

    this.cursors.up.on('down', () => {
      this.grid.moveCursor(0, -1);
    });

    this.cursors.down.on('down', () => {
      this.grid.moveCursor(0, 1);
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      this.grid.swapBlocks();
      this.grid.checkPatterns();
    });
    this.input.keyboard.on('keydown-R', () => {
      this.grid.resetGrid();
      this.grid.checkPatterns();
    });
    this.input.keyboard.on('keydown-S', this.slowGame, this);
    this.input.keyboard.on('keydown-P', this.togglePause, this);

    this.units = [];


    const unitPatterns = this.cache.json.get('unitPatterns');
    this.grid.patternMatcher.setPatterns(unitPatterns);

    this.battlefield = new Battlefield(this);

    this.healthTracker = new HealthTracker(this, this.sys.game.config.width / 3, 0, this.battlefield.playerHealth, this.battlefield.enemyCastle.health, 1000);

    this.endText = this.add.text(
      this.sys.game.config.width / 2, 
      this.sys.game.config.height / 2, 
      '', 
      { fontSize: '32px', fill: '#fff' }
    ).setOrigin(0.5, 0.5).setVisible(false);


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
    // Load the spritesheet
    this.load.spritesheet('infantry', './assets/infantry.webp', {
      frameWidth: 77,
      frameHeight: 90,
    });
    this.load.spritesheet('infantry_att', './assets/infantry.webp', {
      frameWidth: 110,
      frameHeight: 87,
    });
    this.load.spritesheet('rider', './assets/rider.webp', {
      frameWidth: 77,
      frameHeight: 90,
    });
    this.load.spritesheet('rider_att', './assets/rider.webp', {
      frameWidth: 120,
      frameHeight: 87,
    });
  }

  update() {
    if (this.battlefield.gameOver) {
      // Show end screen
      let endMessage;
      if (this.battlefield.enemyCastle.health <= 0) {
        endMessage = 'You win! Enemy castle is destroyed.';
      } else if (this.battlefield.playerHealth <= 0) {
        endMessage = 'You lose! Your castle is destroyed.';
      } else {
        endMessage = 'Time\'s up!';
      }
      this.endText.setText(endMessage).setVisible(true);

      // Listen for 'R' to restart the game
      this.input.keyboard.once('keydown-R', () => {
        this.scene.restart();
      });
    } else {
      if (!this.isPaused && !this.battlefield.gameOver) {
        // Continue the game...
        this.battlefield.update();
        this.healthTracker.updatePlayerHealth(this.battlefield.playerHealth);
        this.healthTracker.updateEnemyHealth(this.battlefield.enemyCastle.health);

        const minutes = Math.floor(this.battlefield.timer / 60);
        const seconds = Math.floor(this.battlefield.timer % 60);
        const timerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        this.healthTracker.updateTimer(timerText);
      }
    }
  }
}
