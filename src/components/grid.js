import Phaser from "phaser";
import PatternMatcher from "./patternMatcher";

export default class Grid extends Phaser.GameObjects.Container {
  constructor(scene, x, y, rows, cols, cellSize) {
    super(scene, x, y);
    this.isGridResetting = false;
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
    const images = ["wood", "steel", "magic", "fire"];
    for (let row = 0; row < this.rows; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.cols; col++) {
        const imageKey = Phaser.Math.RND.pick(images);
        const block = new Phaser.GameObjects.Image(
          this.scene,
          col * this.cellSize * this.scaleX,
          row * this.cellSize * this.scaleY,
          imageKey,
        ).setOrigin(0, 0);
        block.setScale(this.cellSize / 8);
        block.color = imageKey;
        this.add(block);
        this.grid[row][col] = block;
      }
    }
    this.craftAreaBorder = this.scene.add.graphics();
    // golden border around two bottom rows
    this.craftAreaBorder.lineStyle(3, 0xffd700, 1);

    this.craftAreaBorder.strokeRect(
      0,
      (this.rows - 2) * this.cellSize * this.scaleY,
      this.cols * this.cellSize * this.scaleX,
      2 * this.cellSize * this.scaleY,
    );

    // add middle horizontal line
    this.craftAreaBorder.strokeLineShape(
      new Phaser.Geom.Line(
        0,
        (this.rows - 1) * this.cellSize * this.scaleY,
        this.cols * this.cellSize * this.scaleX,
        (this.rows - 1) * this.cellSize * this.scaleY,
      ),
    );
    // add vertical lines
    for (let i = 0; i < this.cols; i++) {
      this.craftAreaBorder.strokeLineShape(
        new Phaser.Geom.Line(
          i * this.cellSize * this.scaleX,
          (this.rows - 2) * this.cellSize * this.scaleY,
          i * this.cellSize * this.scaleX,
          this.rows * this.cellSize * this.scaleY,
        ),
      );
    }
    this.add(this.craftAreaBorder);
  }

  resetGrid() {
    if (this.isGridResetting) {
      return;
    }
    this.isGridResetting = true;
    this.cursorObj.visible = false;
    this.craftAreaBorder.setVisible(false);
    const matchedPatterns = this.patternMatcher.matchPatterns();
    matchedPatterns.forEach((pattern) => {
      this.scene.battlefield.spawnUnit(pattern.unit, "L");
    });
    const resetDuration = matchedPatterns.length === 0 ? 1200 : 100;
    this.clearUnitOverlays();

    // Collect all blocks as a flat array for a single multi-target tween
    const allBlocks = this.grid.flat();
    const firstBlock = allBlocks[0];
    const targetX = -firstBlock.displayWidth;

    this.scene.tweens.add({
      targets: allBlocks,
      x: targetX,
      duration: resetDuration,
      ease: "Linear",
      onComplete: () => {
        // Randomize and reposition all blocks at once
        const images = ["wood", "steel", "magic", "fire"];
        for (let row = 0; row < this.rows; row++) {
          for (let col = 0; col < this.cols; col++) {
            const imageKey = Phaser.Math.RND.pick(images);
            this.grid[row][col].setTexture(imageKey);
            this.grid[row][col].setPosition(
              col * this.cellSize,
              row * this.cellSize,
            );
            this.grid[row][col].color = imageKey;
          }
        }
        this.craftAreaBorder.setVisible(true);
        this.isGridResetting = false;
        this.cursorObj.visible = true;
        this.runPatternCheck();
      },
    });
  }

  createCursor() {
    this.cursorObj = this.scene.add.graphics();
    this.cursorObj.lineStyle(4, 0xffffff, 1);
    this.cursorObj.strokeRect(
      0,
      0,
      this.cellSize * this.scaleX,
      this.cellSize * this.scaleY,
    );
    this.add(this.cursorObj);
    this.moveCursor(0, 0);
    this.selectedPosition = null;
    this.selectedBlockOutline = new Phaser.GameObjects.Rectangle(
      this.scene,
      0,
      0,
      this.cellSize * this.scaleX,
      this.cellSize * this.scaleY,
      0xffffff,
      0.5,
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
      this.cursor.row * this.cellSize,
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
      this.cursor.row * this.cellSize,
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

      let unitWidth, unitHeight;

      // Check if the texture is from a spritesheet
      if (unitTexture.frames && Object.keys(unitTexture.frames).length > 1) {
        // Spritesheet case: Get dimensions of the first frame
        const frame = unitTexture.frames[Object.keys(unitTexture.frames)[0]];
        unitWidth = frame.cutWidth;
        unitHeight = frame.cutHeight;
      } else {
        // Single image case: Use the source image dimensions
        unitWidth = unitTexture.source[0].width;
        unitHeight = unitTexture.source[0].height;
      }

      const desiredWidth = size.width * this.cellSize * 0.97;
      const desiredHeight = size.height * this.cellSize * 0.97;

      const scaleX = desiredWidth / unitWidth;
      const scaleY = desiredHeight / unitHeight;
      const scale = Math.min(scaleX, scaleY);

      const rescaledWidth = unitWidth * scale;
      const rescaledHeight = unitHeight * scale;

      const unitOverlayBg = new Phaser.GameObjects.Rectangle(
        this.scene,
        col * this.cellSize,
        (row - size.height + 1) * this.cellSize,
        size.width * this.cellSize,
        size.height * this.cellSize,
        0xadd8e6,
        0.4,
      ).setOrigin(0, 0);
      this.unitOverlayGroup.add(unitOverlayBg);
      this.add(unitOverlayBg);

      const unitOverlaySprite = new Phaser.GameObjects.Image(
        this.scene,
        col * this.cellSize + (size.width * this.cellSize - rescaledWidth) / 2,
        (row - size.height + 1) * this.cellSize -
          (this.cellSize * size.height - rescaledHeight) / 2,
        pattern.unit,
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

      // Swap the position of the two blocks
      const currentX = currentBlock.x;
      const currentY = currentBlock.y;
      currentBlock.setPosition(selectedBlock.x, selectedBlock.y);
      selectedBlock.setPosition(currentX, currentY);

      // Swap blocks in the grid
      this.grid[newRow][newCol] = selectedBlock;
      this.grid[oldRow][oldCol] = currentBlock;

      // Check for patterns
      this.runPatternCheck();

      this.selectedBlockOutline.visible = false;
      this.selectedPosition = null;
    } else {
      this.selectedPosition = { row: this.cursor.row, col: this.cursor.col };
      const selectedBlock =
        this.grid[this.selectedPosition.row][this.selectedPosition.col];
      this.selectedBlockOutline.setPosition(selectedBlock.x, selectedBlock.y);
      this.selectedBlockOutline.visible = true;
    }
  }
}
