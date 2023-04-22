import Phaser from 'phaser';
import PatternMatcher from './patternMatcher';

export default class Grid extends Phaser.GameObjects.Container {
  constructor(scene, x, y, rows, cols, cellSize) {
    super(scene, x, y);
    this.rows = rows;
    this.cols = cols;
    this.cellSize = 64;
    this.grid = [];
    this.cursor = { row: rows - 1, col: 0 };
    this.cellSize = cellSize;

    this.createGrid();
    this.createCursor();
    this.patternMatcher = new PatternMatcher(this);
    scene.add.existing(this);
  }

  createGrid() {
    const images = ['wood', 'steel', 'magic', 'fire'];
    for (let row = 0; row < this.rows; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.cols; col++) {
        const imageKey = Phaser.Math.RND.pick(images);
        const block = new Phaser.GameObjects.Image(
          this.scene,
          col * this.cellSize * this.scaleX,
          row * this.cellSize * this.scaleY,
          imageKey
        ).setOrigin(0, 0);
        block.setScale(this.cellSize/8)
        block.color = imageKey;
        this.add(block);
        this.grid[row][col] = block;
      }
    }
  }

  resetGrid() {
    const images = ['wood', 'steel', 'magic', 'fire'];
    for (let row = 0; row < this.grid.length; row++) {
      for (let col = 0; col < this.grid[row].length; col++) {
        const block = this.grid[row][col];

        // Calculate the target position for the block
        const targetX = -block.displayWidth;

        // Create the tween and add it to the scene
        this.scene.tweens.add({
          targets: block,
          x: targetX,
          duration: 300,
          ease: 'Linear',
          onComplete: () => {
            const imageKey = Phaser.Math.RND.pick(images);
            this.grid[row][col].setTexture(imageKey);
            this.grid[row][col].setPosition(
              col * this.cellSize,
              row * this.cellSize,
            );
            this.grid[row][col].color = imageKey;
          },
        });
      }
    }
    const matchedPatterns = this.patternMatcher.matchPatterns();
    matchedPatterns.forEach((pattern) => {
      this.scene.battlefield.spawnUnit(pattern.unit);
    });
  }


  createCursor() {
    this.cursorObj = new Phaser.GameObjects.Rectangle(
      this.scene,
      0,
      this.cellSize * (this.rows - 1),
      this.cellSize * this.scaleX,
      this.cellSize * this.scaleY,
      0xffffff,
      0.5
    ).setOrigin(0, 0);
    this.add(this.cursorObj);
    this.selectedPosition = null;
    this.selectedBlockOutline = new Phaser.GameObjects.Rectangle(
      this.scene,
      0,
      0,
      this.cellSize * this.scaleX,
      this.cellSize * this.scaleY,
      0xffffff,
      1
    ).setOrigin(0, 0);
    this.selectedBlockOutline.setStrokeStyle(2, 0xffffff);
    this.selectedBlockOutline.visible = false;
    this.add(this.selectedBlockOutline);
  }

  moveCursor(x, y) {
    this.cursor.col = Phaser.Math.Clamp(this.cursor.col + x, 0, this.cols - 1);
    this.cursor.row = Phaser.Math.Clamp(this.cursor.row + y, 0, this.rows - 1);
    this.cursorObj.setPosition(
      this.cursor.col * this.cellSize,
      this.cursor.row * this.cellSize
    );
  }

  swapBlocks() {
    if (this.selectedPosition) {
      const oldRow = this.selectedPosition.row;
      const oldCol = this.selectedPosition.col;
      const newRow = this.cursor.row;
      const newCol = this.cursor.col;
      const selectedBlock = this.grid[oldRow][oldCol];
      const currentBlock = this.grid[newRow][newCol];

      // Swap the position of the two blocks
      const currentX = currentBlock.x;
      const currentY = currentBlock.y;
      currentBlock.setPosition(selectedBlock.x, selectedBlock.y);
      selectedBlock.setPosition(currentX, currentY);

      // Swap blocks in the grid
      this.grid[newRow][newCol] = selectedBlock;
      this.grid[oldRow][oldCol] = currentBlock;

      this.selectedBlockOutline.visible = false;
      this.selectedPosition = null;
    } else {
      this.selectedPosition = {row: this.cursor.row, col: this.cursor.col};
      const selectedBlock = this.grid[this.selectedPosition.row][this.selectedPosition.col]
      this.selectedBlockOutline.setPosition(selectedBlock.x, selectedBlock.y);
      this.selectedBlockOutline.visible = true;
    }
  }

  checkPatterns() {
    const matchedPatterns = this.patternMatcher.matchPatterns();
    console.log('found patterns', matchedPatterns);
  }
}
