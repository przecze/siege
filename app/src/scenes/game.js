import Phaser from 'phaser';
import Grid from '../components/grid';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('game');
  }

  create() {
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
    });
    this.input.keyboard.on('keydown-R', () => {
      this.grid.resetGrid();
    });

    // Initialize the timer for spawning infantry
    this.spawnTimer = this.time.addEvent({
      delay: 2000,
      callback: this.spawnInfantry,
      callbackScope: this,
      loop: true,
    });
  }

  spawnInfantry() {
    const infantry = new Infantry(this, 0, this.sys.game.config.height / 2);
    this.units.push(infantry);
  }

  update() {
    this.units.forEach(unit => {
      unit.update();
      if (unit.sprite.x > this.sys.game.config.width) {
        unit.destroy();
        this.units.shift();
      }
    });
  }
}
