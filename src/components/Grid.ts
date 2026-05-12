import Phaser from 'phaser';
import { PatternMatcher } from './PatternMatcher';

interface GridBlock extends Phaser.GameObjects.Image { color: string; }

export class Grid extends Phaser.GameObjects.Container {
  rows: number;
  cols: number;
  cellSize: number;
  grid: GridBlock[][];
  patternMatcher: PatternMatcher;
  craftAreaBorder!: Phaser.GameObjects.Graphics;

  private cursor: { row: number; col: number };
  private cursorObj!: Phaser.GameObjects.Graphics;
  private selectedPosition: { row: number; col: number } | null = null;
  private selectedBlockOutline!: Phaser.GameObjects.Rectangle;
  private unitOverlayGroup!: Phaser.GameObjects.Group;
  private isGridResetting = false;

  constructor(scene: Phaser.Scene, x: number, y: number, rows: number, cols: number, cellSize: number) {
    super(scene, x, y);
    this.rows = rows;
    this.cols = cols;
    this.cellSize = cellSize;
    this.grid = [];
    this.cursor = { row: rows - 1, col: 0 };

    this.createGrid();
    this.createCursor();
    this.patternMatcher = new PatternMatcher(this);
    scene.add.existing(this);
    this.unitOverlayGroup = scene.add.group();
    this.runPatternCheck();
  }

  private createGrid(): void {
    const images = ['wood', 'steel', 'magic', 'fire'];
    for (let row = 0; row < this.rows; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.cols; col++) {
        const imageKey = Phaser.Math.RND.pick(images);
        const block = new Phaser.GameObjects.Image(
          this.scene, col * this.cellSize * this.scaleX, row * this.cellSize * this.scaleY, 'elements', imageKey,
        ).setOrigin(0, 0) as GridBlock;
        block.setScale(this.cellSize / 16);
        block.color = imageKey;
        this.add(block);
        this.grid[row][col] = block;
      }
    }

    this.craftAreaBorder = this.scene.add.graphics();
    this.craftAreaBorder.lineStyle(3, 0xffd700, 1);
    this.craftAreaBorder.strokeRect(
      0, (this.rows - 2) * this.cellSize * this.scaleY,
      this.cols * this.cellSize * this.scaleX, 2 * this.cellSize * this.scaleY,
    );
    this.craftAreaBorder.strokeLineShape(new Phaser.Geom.Line(
      0, (this.rows - 1) * this.cellSize * this.scaleY,
      this.cols * this.cellSize * this.scaleX, (this.rows - 1) * this.cellSize * this.scaleY,
    ));
    for (let i = 0; i < this.cols; i++) {
      this.craftAreaBorder.strokeLineShape(new Phaser.Geom.Line(
        i * this.cellSize * this.scaleX, (this.rows - 2) * this.cellSize * this.scaleY,
        i * this.cellSize * this.scaleX, this.rows * this.cellSize * this.scaleY,
      ));
    }
    this.add(this.craftAreaBorder);
  }

  private createCursor(): void {
    this.cursorObj = this.scene.add.graphics();
    this.cursorObj.lineStyle(4, 0xffffff, 1);
    this.cursorObj.strokeRect(0, 0, this.cellSize * this.scaleX, this.cellSize * this.scaleY);
    this.add(this.cursorObj);
    this.moveCursor(0, 0);

    this.selectedBlockOutline = new Phaser.GameObjects.Rectangle(
      this.scene, 0, 0, this.cellSize * this.scaleX, this.cellSize * this.scaleY, 0xffffff, 0.5,
    ).setOrigin(0, 0);
    this.selectedBlockOutline.setStrokeStyle(2, 0xffffff);
    this.selectedBlockOutline.visible = false;
    this.add(this.selectedBlockOutline);
  }

  moveCursor(dx: number, dy: number): void {
    this.cursor.col = Phaser.Math.Clamp(this.cursor.col + dx, 0, this.cols - 1);
    this.cursor.row = Phaser.Math.Clamp(this.cursor.row + dy, 0, this.rows - 1);
    this.cursorObj.setPosition(this.cursor.col * this.cellSize, this.cursor.row * this.cellSize);
  }

  getGridCoordinates(pixelX: number, pixelY: number): { row: number; col: number } | null {
    const col = Math.floor(pixelX / (this.cellSize * this.scaleX));
    const row = Math.floor(pixelY / (this.cellSize * this.scaleY));
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return null;
    return { col, row };
  }

  touchBlockXY(row: number, col: number): void {
    this.cursor.col = col;
    this.cursor.row = row;
    this.cursorObj.setPosition(this.cursor.col * this.cellSize, this.cursor.row * this.cellSize);
    this.swapBlocks();
  }

  clearUnitOverlays(): void {
    this.unitOverlayGroup.clear(true, true);
  }

  resetGrid(): void {
    if (this.isGridResetting) return;
    this.isGridResetting = true;
    this.cursorObj.visible = false;
    this.craftAreaBorder.setVisible(false);

    const matchedPatterns = this.patternMatcher.matchPatterns();
    matchedPatterns.forEach(pattern => {
      (this.scene as Phaser.Scene & { battlefield: { spawnUnit(id: string, side: string): void } })
        .battlefield.spawnUnit(pattern.unit, 'L');
    });

    const resetDuration = matchedPatterns.length === 0 ? 1200 : 100;
    this.clearUnitOverlays();

    const allBlocks = this.grid.flat();
    const targetX = -allBlocks[0].displayWidth;

    this.scene.tweens.add({
      targets: allBlocks,
      x: targetX,
      duration: resetDuration,
      ease: 'Linear',
      onComplete: () => {
        const images = ['wood', 'steel', 'magic', 'fire'];
        for (let row = 0; row < this.rows; row++) {
          for (let col = 0; col < this.cols; col++) {
            const imageKey = Phaser.Math.RND.pick(images);
            this.grid[row][col].setTexture('elements', imageKey);
            this.grid[row][col].setPosition(col * this.cellSize, row * this.cellSize);
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

  runPatternCheck(): void {
    this.clearUnitOverlays();
    const matchedPatterns = this.patternMatcher.matchPatterns();
    matchedPatterns.forEach(pattern => {
      const { row, col } = pattern.position;
      const { width, height } = pattern.size;

      const unitTexture = this.scene.textures.get(pattern.unit);
      let unitWidth: number, unitHeight: number;
      const frameKeys = Object.keys(unitTexture.frames);
      if (frameKeys.length > 1) {
        const frame = (unitTexture.frames as Record<string, Phaser.Textures.Frame>)[frameKeys[0]];
        unitWidth = frame.cutWidth;
        unitHeight = frame.cutHeight;
      } else {
        unitWidth = unitTexture.source[0].width;
        unitHeight = unitTexture.source[0].height;
      }

      const desiredWidth = width * this.cellSize * 0.97;
      const desiredHeight = height * this.cellSize * 0.97;
      const scale = Math.min(desiredWidth / unitWidth, desiredHeight / unitHeight);
      const rescaledWidth = unitWidth * scale;
      const rescaledHeight = unitHeight * scale;

      const bg = new Phaser.GameObjects.Rectangle(
        this.scene, col * this.cellSize, (row - height + 1) * this.cellSize,
        width * this.cellSize, height * this.cellSize, 0xadd8e6, 0.4,
      ).setOrigin(0, 0);
      this.unitOverlayGroup.add(bg);
      this.add(bg);

      const sprite = new Phaser.GameObjects.Image(
        this.scene,
        col * this.cellSize + (width * this.cellSize - rescaledWidth) / 2,
        (row - height + 1) * this.cellSize - (this.cellSize * height - rescaledHeight) / 2,
        pattern.unit,
      ).setOrigin(0, 0).setScale(scale);
      this.unitOverlayGroup.add(sprite);
      this.add(sprite);
    });
  }

  swapBlocks(): void {
    if (this.selectedPosition) {
      this.clearUnitOverlays();
      const { row: oldRow, col: oldCol } = this.selectedPosition;
      const { row: newRow, col: newCol } = this.cursor;
      const selected = this.grid[oldRow][oldCol];
      const current = this.grid[newRow][newCol];

      const currentX = current.x;
      const currentY = current.y;
      current.setPosition(selected.x, selected.y);
      selected.setPosition(currentX, currentY);

      this.grid[newRow][newCol] = selected;
      this.grid[oldRow][oldCol] = current;

      this.runPatternCheck();
      this.selectedBlockOutline.visible = false;
      this.selectedPosition = null;
    } else {
      this.selectedPosition = { row: this.cursor.row, col: this.cursor.col };
      const block = this.grid[this.selectedPosition.row][this.selectedPosition.col];
      this.selectedBlockOutline.setPosition(block.x, block.y);
      this.selectedBlockOutline.visible = true;
    }
  }
}
