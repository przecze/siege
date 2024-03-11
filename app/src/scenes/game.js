import Phaser from 'phaser';
import Grid from '../components/grid';
import UnitPatternAtlas from '../components/unitPatternAtlas';
import Battlefield from '../components/battlefield';
import HealthTracker from '../components/healthTracker';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('game');
    this.isPaused = false;
    window.b = this
  }

  create() {
    let bg = this.add.image(0, 0, 'background').setOrigin(0, 0);
    let scaleX = this.cameras.main.width / bg.width;
    let scaleY = this.cameras.main.height / bg.height;
    let scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);
    const cellSize = this.sys.game.config.height / 12;
    this.grid = new Grid(this, 0, 0, 5, 6, cellSize);
    this.grid.cellSize = cellSize;
    this.grid.setPosition(0, 0);
    this.grid.setScale(cellSize / 64);
    // create the send troops button
    this.sendTroopsButtonBg = this.add.rectangle(
      cellSize * this.grid.scaleY * 0.5,
      cellSize * this.grid.scaleX * 5.3,
      120, // width of the rectangle
      50, // height of the rectangle
      0x808080 // color of the rectangle (gray)
    );
    this.sendTroopsButtonBg.setOrigin(0, 0); // set origin to top left corner

    this.sendTroopsButton = this.add.text(
      this.sendTroopsButtonBg.x + this.sendTroopsButtonBg.width / 2, // center the text horizontally
      this.sendTroopsButtonBg.y + this.sendTroopsButtonBg.height / 2, // center the text vertically
      "Send Troops",
      { fill: '#0f0' }
    )
    .setOrigin(0.5, 0.5) // center the text origin
    .setInteractive()
    .on('pointerdown', () => this.grid.resetGrid());

    // add the rectangle as a background to the button
    this.sendTroopsButton.setDepth(2); // send the text to front
    this.sendTroopsButtonBg.setDepth(1); // send the rectangle to back


    // only show it on mobile devices
    this.sendTroopsButton.visible = !this.sys.game.device.os.desktop;
    this.sendTroopsButtonBg.visible = !this.sys.game.device.os.desktop;

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

    const atlasWidth = this.grid.cols * this.grid.cellSize
			 * this.grid.scaleX * 2;
    const atlasHeight = this.grid.rows * this.grid.cellSize
			 * this.grid.scaleY* 2;
    this.unitPatternAtlas = new UnitPatternAtlas(this, 0, 0, atlasWidth, atlasHeight);
    this.input.keyboard.on('keydown-V', () => {
      this.unitPatternAtlas.setVisible(true);
    });
    this.input.keyboard.on('keyup-V', () => {
      this.unitPatternAtlas.setVisible(false);
    });

    this.input.on('pointerdown', (pointer) => {
      const gridCoordinates = this.grid.getGridCoordinates(pointer.x, pointer.y);
      // only call touchBlockXY if the coordinates are inside the grid
      if (gridCoordinates) {
        this.grid.touchBlockXY(gridCoordinates.row, gridCoordinates.col);
      }
    });




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
    this.load.image('background', './assets/background.png');
    this.load.image('arrow', './assets/arrow.png');
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

    // Load Archer animation frames
    const archerAnimationPaths = {
        Idle: { start: 1, end: 6, prefix: 'Idle_' },
        Run: { start: 1, end: 6, prefix: 'Move_' },
        Shoot: { start: 1, end: 12, prefix: 'Skill2_' },
        Attack: { start: 1, end: 9, prefix: 'Attack_' },
    };

    for (const [animKey, animData] of Object.entries(archerAnimationPaths)) {
        for (let i = animData.start; i <= animData.end; i++) {
            let frameKey = `archer_${animKey.toLowerCase()}_${i}`;
            let fileName = `${animData.prefix}${i}.png`;
            this.load.image(frameKey, `assets/archer/ani_cropped/${fileName}`,);
        }
    }
    // also default archer texture for grid overlay
    this.load.image('archer', 'assets/archer/ani_cropped/Idle_1.png');
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
