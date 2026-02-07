import Phaser from 'phaser';

export default class UnitPatternAtlas extends Phaser.GameObjects.Container {
  constructor(scene, x, y, width, height) {
    super(scene, x, y);
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.addBackground();
    this.addUnitsAndPatterns();

    scene.add.existing(this);
    this.setVisible(false);
  }

  addBackground() {
    const background = new Phaser.GameObjects.Rectangle(
        this.scene, 0, 0, this.width, this.height, 0x000000, 0.9);
    this.add(background);
  }

  addUnitsAndPatterns() {
    const unitPatterns = this.scene.cache.json.get('unitPatterns');
    // use fire tile to get the size of the sprite
    const tileSize = this.scene.textures.getFrame('elements', 'fire').width;

    // calculate total height of all patterns
    let tilesCountHeight = 0;
    unitPatterns.forEach((pattern) => {
      tilesCountHeight += pattern.pattern.length;
    });
    // add gaps between patterns with 1/3 tile size
    tilesCountHeight += (unitPatterns.length - 1)/3;
    const xOffset = 20;
    const availableHeight = this.height - 4*xOffset;
    const scaledTileSize = availableHeight / tilesCountHeight/2;
    const scale = scaledTileSize / tileSize;
    const patternGap = scaledTileSize / 3;


    let yPos = xOffset; // Start position for Y
    unitPatterns.forEach((pattern) => {
      const patternRepresentation = pattern.pattern;
      const patternHeight = patternRepresentation.length;
      const patternWidth = patternRepresentation[0].length;
      const borderSize = scaledTileSize/10;
      const patternBg = new Phaser.GameObjects.Rectangle(
          this.scene,
          xOffset - borderSize,
				  yPos - borderSize,
          patternWidth*scaledTileSize+2*borderSize,
          patternHeight*scaledTileSize+2*borderSize,
          0xffff00, 0.5);
			patternBg.setOrigin(0, 0);
      this.add(patternBg);
      patternRepresentation.forEach((row, rowIndex) => {
        let xPos = xOffset; // Start position for X
        row.forEach((tile, colIndex) => {
          const tileSprite = this.scene.add.sprite(xPos, yPos, 'elements', tile);
          tileSprite.setScale(scale, scale); // Apply calculated scale
          this.add(tileSprite);
					tileSprite.setOrigin(0, 0);
          xPos += scaledTileSize;
        });
        yPos += scaledTileSize;
      });
      const unitTexture = this.scene.textures.get(pattern.unit);
      let unitWidth, unitHeight;
      // Check if the texture is from a spritesheet
      if (unitTexture.frames && Object.keys(unitTexture.frames).length > 1) {
          // Spritesheet case: Get dimensions of the first frame
          const frame = unitTexture.frames[Object.keys(unitTexture.frames)[0]];
          unitHeight = frame.cutHeight;
      } else {
          // Single image case: Use the source image dimensions
          unitHeight = unitTexture.source[0].height;
      }
		  const unitSpriteXOffset = patternWidth*scaledTileSize;
			const unitSpriteDesiredHeight = scaledTileSize * 1.2;
			const unitSpriteScale = unitSpriteDesiredHeight / unitHeight;
			let unitSpriteYOffset = yPos - unitSpriteDesiredHeight;
			unitSpriteYOffset -= (patternHeight - 1) * scaledTileSize/2;
			const unitSprite = this.scene.add.sprite(
				xOffset+unitSpriteXOffset + patternGap,
				unitSpriteYOffset, unitTexture);
			unitSprite.setOrigin(0, 0);
			this.add(unitSprite);
			unitSprite.setScale(unitSpriteScale, unitSpriteScale);

      yPos += patternGap;
    });
  }

}

