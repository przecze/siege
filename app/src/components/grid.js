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
    this.unitOverlayGroup = this.scene.add.group();
    this.runPatternCheck();
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
    this.clearUnitOverlays();
    const images = ['wood', 'steel', 'magic', 'fire'];
    let completeCount = 0;
    const totalCount = this.rows * this.cols;
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
            completeCount++;
            if (completeCount === totalCount) {
              this.runPatternCheck();
            }
          },
        });
      }
    }
    const matchedPatterns = this.patternMatcher.matchPatterns();
    matchedPatterns.forEach((pattern) => {
      this.scene.battlefield.spawnUnit(pattern.unit, 'L');
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

  clearUnitOverlays() {
    this.unitOverlayGroup.clear(true, true);
  }

  getGridCoordinates(pixelX, pixelY) {
    const col = Math.floor(pixelX / (this.cellSize * this.scaleX));
    const row = Math.floor(pixelY / (this.cellSize * this.scaleY));

    // check if coordinates are outside of the grid
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return null;
    }

    return { col, row };
  }


  touchBlockXY(row, col) {
    // Move the cursor to the clicked block
    this.cursor.col = col;
    this.cursor.row = row;
    this.cursorObj.setPosition(
      this.cursor.col * this.cellSize,
      this.cursor.row * this.cellSize
    );

    // Trigger a block swap
    this.swapBlocks();
  }


  runPatternCheck() {
    const matchedPatterns = this.patternMatcher.matchPatterns();
    matchedPatterns.forEach((pattern) => {
      const { row, col } = pattern.position;
      const size = pattern.size;

      const unitTexture = this.scene.textures.get(pattern.unit);
      const unitWidth = unitTexture.source[0].width;
      const unitHeight = unitTexture.source[0].height;

      const scaleX = 8 * 0.8 * size.width * this.cellSize / unitWidth;
      const scaleY = 8 * 0.8 * size.height * this.cellSize / unitHeight;
      const scale = Math.min(scaleX, scaleY) * (pattern.unit === 'archer' ? 0.5 : 1);

      const unitOverlayBg = new Phaser.GameObjects.Rectangle(
        this.scene,
        col * this.cellSize,
        (row - size.height + 1) * this.cellSize,
        size.width * this.cellSize,
        size.height * this.cellSize,
        0xADD8E6,
        0.5
      ).setOrigin(0, 0);
      this.unitOverlayGroup.add(unitOverlayBg);
      this.add(unitOverlayBg);

      const unitOverlaySprite = new Phaser.GameObjects.Image(
        this.scene,
        col * this.cellSize + (size.width * this.cellSize - this.cellSize * scale) / 2,
        (row - size.height + 1) * this.cellSize - (this.cellSize - this.cellSize * scale) / 2,
        pattern.unit
      ).setOrigin(0, 0);
      unitOverlaySprite.setScale(scale);
      this.unitOverlayGroup.add(unitOverlaySprite);
      this.add(unitOverlaySprite);
    });
  }

  swapBlocks() {
    if (this.selectedPosition) {
      this.clearUnitOverlays();
      const { row: oldRow, col: oldCol } = this.selectedPosition;
      const newRow = this.cursor.row;
      const newCol = this.cursor.col;
      const selectedBlock = this.grid[oldRow][oldCol];
      const currentBlock = this.grid[newRow][newCol];

      console.log('Swapping blocks...');
      console.log('Selected Block:', selectedBlock);
      console.log('Current Block:', currentBlock);

      // Swap the position of the two blocks
      const currentX = currentBlock.x;
      const currentY = currentBlock.y;
      currentBlock.setPosition(selectedBlock.x, selectedBlock.y);
      selectedBlock.setPosition(currentX, currentY);

      // Swap blocks in the grid
      this.grid[newRow][newCol] = selectedBlock;
      this.grid[oldRow][oldCol] = currentBlock;

      console.log('Blocks swapped successfully.');

      // Check for patterns
      const matchedPatterns = this.patternMatcher.matchPatterns();

      if (matchedPatterns.length > 0) {
        console.log('Matched Patterns:', matchedPatterns);
      } else {
        console.log('No patterns matched.');
      }
      this.runPatternCheck();

      this.selectedBlockOutline.visible = false;
      this.selectedPosition = null;
    } else {
      this.selectedPosition = { row: this.cursor.row, col: this.cursor.col };
      const selectedBlock = this.grid[this.selectedPosition.row][this.selectedPosition.col];
      this.selectedBlockOutline.setPosition(selectedBlock.x, selectedBlock.y);
      this.selectedBlockOutline.visible = true;
    }
  }


  checkPatterns() {
    const matchedPatterns = this.patternMatcher.matchPatterns();
  }
}
