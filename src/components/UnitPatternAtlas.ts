import Phaser from 'phaser';

export class UnitPatternAtlas extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    super(scene, x, y);
    this.addBackground(width, height);
    this.addUnitsAndPatterns(width, height);
    scene.add.existing(this);
    this.setVisible(false);
  }

  private addBackground(width: number, height: number): void {
    this.add(new Phaser.GameObjects.Rectangle(this.scene, 0, 0, width, height, 0x000000, 0.9));
  }

  private addUnitsAndPatterns(containerWidth: number, containerHeight: number): void {
    const unitPatterns: { unit: string; pattern: string[][] }[] = this.scene.cache.json.get('unitPatterns');
    const tileSize = this.scene.textures.getFrame('elements', 'fire').width;

    let tilesCountHeight = 0;
    unitPatterns.forEach(p => { tilesCountHeight += p.pattern.length; });
    tilesCountHeight += (unitPatterns.length - 1) / 3;

    const xOffset = 20;
    const scaledTileSize = (containerHeight - 4 * xOffset) / tilesCountHeight / 2;
    const scale = scaledTileSize / tileSize;
    const patternGap = scaledTileSize / 3;

    let yPos = xOffset;

    unitPatterns.forEach(pattern => {
      const { pattern: grid, unit } = pattern;
      const patternHeight = grid.length;
      const patternWidth = grid[0].length;
      const borderSize = scaledTileSize / 10;

      const bg = new Phaser.GameObjects.Rectangle(
        this.scene, xOffset - borderSize, yPos - borderSize,
        patternWidth * scaledTileSize + 2 * borderSize,
        patternHeight * scaledTileSize + 2 * borderSize,
        0xffff00, 0.5,
      ).setOrigin(0, 0);
      this.add(bg);

      grid.forEach((row, rowIndex) => {
        let xPos = xOffset;
        row.forEach(tile => {
          const sprite = this.scene.add.sprite(xPos, yPos, 'elements', tile)
            .setScale(scale).setOrigin(0, 0);
          this.add(sprite);
          xPos += scaledTileSize;
        });
        yPos += scaledTileSize;
      });

      const unitTexture = this.scene.textures.get(unit);
      const frameKeys = Object.keys(unitTexture.frames);
      const unitHeight = frameKeys.length > 1
        ? (unitTexture.frames as Record<string, Phaser.Textures.Frame>)[frameKeys[0]].cutHeight
        : unitTexture.source[0].height;

      const desiredHeight = scaledTileSize * 1.2;
      const unitScale = desiredHeight / unitHeight;
      const unitSpriteYOffset = yPos - desiredHeight - (patternHeight - 1) * scaledTileSize / 2;

      const unitSprite = this.scene.add.sprite(
        xOffset + patternWidth * scaledTileSize + patternGap, unitSpriteYOffset, unit,
      ).setOrigin(0, 0).setScale(unitScale);
      this.add(unitSprite);

      yPos += patternGap;
    });
  }
}
