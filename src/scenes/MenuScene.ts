import Phaser from 'phaser';

interface PatternData { unit: string; pattern: string[][]; }
interface MatchResult { unit: string; position: { row: number; col: number }; size: { width: number; height: number }; }

export class MenuScene extends Phaser.Scene {
  private currentPage = 0;
  private readonly totalPages = 7;
  private pageContainer!: Phaser.GameObjects.Container;
  private prevButton!: Phaser.GameObjects.Text;
  private nextButton!: Phaser.GameObjects.Text;
  private pageIndicator!: Phaser.GameObjects.Text;

  constructor() { super('menu'); }

  create(): void {
    const gfx = this.add.graphics();
    gfx.fillGradientStyle(0x001122, 0x001122, 0x002244, 0x002244, 1);
    gfx.fillRect(0, 0, this.sys.game.config.width as number, this.sys.game.config.height as number);

    this.setupNavigation();
    this.showCurrentPage();
  }

  private setupNavigation(): void {
    const { width, height } = this.sys.game.config as { width: number; height: number };

    this.add.text(width - 20, 20, 'Skip to Game', {
      fontSize: '14px', color: '#888888', backgroundColor: '#333333', padding: { x: 12, y: 6 },
    }).setOrigin(1, 0).setInteractive().on('pointerdown', () => this.scene.start('game'));

    this.prevButton = this.add.text(50, height - 40, '← Previous', {
      fontSize: '16px', color: '#CCCCCC', backgroundColor: '#444444', padding: { x: 15, y: 8 },
    }).setOrigin(0, 1).setInteractive().setVisible(false);

    this.nextButton = this.add.text(width - 50, height - 40, 'Next →', {
      fontSize: '16px', color: '#FFFFFF', backgroundColor: '#006600', padding: { x: 15, y: 8 },
    }).setOrigin(1, 1).setInteractive();

    this.pageIndicator = this.add.text(width / 2, height - 40, '', {
      fontSize: '14px', color: '#FFFFFF', align: 'center',
    }).setOrigin(0.5, 1);

    this.prevButton.on('pointerdown', () => { if (this.currentPage > 0) { this.currentPage--; this.showCurrentPage(); } });
    this.nextButton.on('pointerdown', () => {
      if (this.currentPage < this.totalPages - 1) { this.currentPage++; this.showCurrentPage(); }
      else this.scene.start('game');
    });
    this.nextButton.on('pointerover', () => this.nextButton.setStyle({ backgroundColor: '#008800' }));
    this.nextButton.on('pointerout',  () => this.nextButton.setStyle({ backgroundColor: '#006600' }));
    this.prevButton.on('pointerover', () => this.prevButton.setStyle({ backgroundColor: '#666666' }));
    this.prevButton.on('pointerout',  () => this.prevButton.setStyle({ backgroundColor: '#444444' }));
  }

  private showCurrentPage(): void {
    if (this.pageContainer) this.pageContainer.destroy();
    this.pageContainer = this.add.container(0, 0);

    this.prevButton.setVisible(this.currentPage > 0);
    this.pageIndicator.setText(`${this.currentPage + 1} / ${this.totalPages}`);
    this.nextButton.setText(this.currentPage === this.totalPages - 1 ? 'Start Game!' : 'Next →');

    switch (this.currentPage) {
      case 0: this.showWelcomePage(); break;
      case 1: this.showGridPage(); break;
      case 2: this.showInfantryPage(); break;
      case 3: this.showArcherPage(); break;
      case 4: this.showRiderPage(); break;
      case 5: this.showBattlePage(); break;
      case 6: this.showReadyPage(); break;
    }
  }

  private showWelcomePage(): void {
    const { width, height } = this.sys.game.config as { width: number; height: number };
    this.pageContainer.add([
      this.add.text(width / 2, height * 0.2, 'SIEGE!!', {
        fontSize: '64px', fontFamily: 'Arial Black', color: '#FFD700',
        stroke: '#8B4513', strokeThickness: 6,
        shadow: { offsetX: 4, offsetY: 4, color: '#000000', blur: 8, fill: true },
      }).setOrigin(0.5),
      this.add.text(width / 2, height * 0.3, 'Craft • Battle • Conquer', {
        fontSize: '24px', color: '#CCCCCC', fontStyle: 'italic',
      }).setOrigin(0.5),
      this.add.text(width / 2, height * 0.5,
        'Welcome to SIEGE!\n\nA strategy game where you craft units\nby arranging magical materials on a grid.\n\nDifferent patterns create different troops\nto lead into battle against enemy castle.',
        { fontSize: '20px', color: '#FFFFFF', align: 'center', lineSpacing: 8 },
      ).setOrigin(0.5),
    ]);
  }

  private showGridPage(): void {
    const { width, height } = this.sys.game.config as { width: number; height: number };
    const gridX = width * 0.3;
    const gridY = height * 0.35;
    const cellSize = 30;
    const materials = ['wood', 'steel', 'fire', 'magic'];

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 6; col++) {
        const x = gridX + col * (cellSize + 2);
        const y = gridY + row * (cellSize + 2);
        const sprite = this.add.sprite(x, y, 'elements', Phaser.Math.RND.pick(materials)).setDisplaySize(cellSize, cellSize);
        if (row >= 3) this.pageContainer.add(this.add.rectangle(x, y, cellSize + 4, cellSize + 4).setStrokeStyle(2, 0xFFD700, 0.8));
        if (row === 4 && col === 2) this.pageContainer.add(this.add.rectangle(x, y, cellSize + 6, cellSize + 6).setStrokeStyle(3, 0xFFFFFF));
        this.pageContainer.add(sprite);
      }
    }

    [0, 2, 4].forEach(pos => {
      this.pageContainer.add([
        this.add.text(gridX + pos * (cellSize + 2), gridY + 5 * (cellSize + 2) + 20, '↑', { fontSize: '20px', color: '#00FF00', fontStyle: 'bold' }).setOrigin(0.5, 0),
        this.add.text(gridX + pos * (cellSize + 2), gridY + 5 * (cellSize + 2) + 45, `Pos ${pos}`, { fontSize: '12px', color: '#00FF00' }).setOrigin(0.5, 0),
      ]);
    });

    this.pageContainer.add([
      this.add.text(width / 2, height * 0.1, 'The Crafting Grid', { fontSize: '42px', color: '#FFD700', fontStyle: 'bold' }).setOrigin(0.5),
      this.add.text(width * 0.65, height * 0.25, 'How to Use the Grid:\n\n🎮 ARROW KEYS - Move cursor\n⚡ SPACE BAR - Select/Swap\n🚀 R KEY - Release units!', { fontSize: '12px', color: '#FFFFFF', align: 'left', lineSpacing: 3, wordWrap: { width: 180 } }).setOrigin(0, 0),
      this.add.text(width * 0.65, height * 0.45, '🏗️ BUILD ZONE:', { fontSize: '13px', color: '#FFD700', fontStyle: 'bold' }).setOrigin(0, 0),
      this.add.text(width * 0.65, height * 0.49, 'Golden area = crafting zone\nStart at positions 0, 2, or 4', { fontSize: '11px', color: '#FFFFFF', lineSpacing: 2, wordWrap: { width: 180 } }).setOrigin(0, 0),
    ]);
  }

  private showInfantryPage(): void {
    this.showUnitPage('soldier', 'INFANTRY', 'Stack STEEL over WOOD to create brave foot soldiers', 'Strong melee fighters that form the backbone of your army');
  }

  private showArcherPage(): void {
    this.showUnitPage('archer', 'ARCHER', 'Stack FIRE over WOOD to create skilled marksmen', 'Ranged attackers that strike from a distance');
  }

  private showRiderPage(): void {
    this.showUnitPage('lancer', 'RAIDER', 'Create a 2×2 pattern: FIRE and STEEL on both rows', 'Fast warriors that charge into battle and deal a lot of damage');
  }

  private showUnitPage(unitKey: string, unitName: string, pattern: string, description: string): void {
    const { width, height } = this.sys.game.config as { width: number; height: number };
    const unitPatterns: PatternData[] = this.cache.json.get('unitPatterns');
    const unitPattern = unitPatterns.find(p => p.unit === unitKey)!;

    this.showPattern(unitPattern, width * 0.3, height * 0.4);

    this.pageContainer.add([
      this.add.text(width / 2, height * 0.15, unitName, { fontSize: '42px', color: '#FFD700', fontStyle: 'bold' }).setOrigin(0.5),
      this.add.sprite(width * 0.7, height * 0.45, unitKey).setScale(3).play({ key: unitKey + '-run', repeat: -1 }),
      this.add.text(width / 2, height * 0.65, pattern, { fontSize: '18px', color: '#FFFFFF', align: 'center', fontStyle: 'bold' }).setOrigin(0.5),
      this.add.text(width / 2, height * 0.75, description, { fontSize: '16px', color: '#CCCCCC', align: 'center' }).setOrigin(0.5),
    ]);
  }

  private showPattern(patternData: PatternData, x: number, y: number): void {
    const tileSize = 50;
    const reversed = [...patternData.pattern].reverse();
    this.pageContainer.add(this.add.text(x, y - 60, 'Pattern:', { fontSize: '16px', color: '#FFFFFF', fontStyle: 'bold' }).setOrigin(0.5));
    for (let row = 0; row < reversed.length; row++) {
      for (let col = 0; col < reversed[row].length; col++) {
        const sx = x + (col - reversed[0].length / 2 + 0.5) * (tileSize + 5);
        const sy = y + (row - reversed.length / 2 + 0.5) * (tileSize + 5);
        this.pageContainer.add([
          this.add.sprite(sx, sy, 'elements', reversed[row][col]).setDisplaySize(tileSize, tileSize),
          this.add.rectangle(sx, sy, tileSize, tileSize).setStrokeStyle(3, 0xFFFFFF, 0.9),
        ]);
      }
    }
  }

  private showBattlePage(): void {
    const { width, height } = this.sys.game.config as { width: number; height: number };
    const unitY = height * 0.6;
    const units = ['soldier', 'archer', 'lancer'];
    units.forEach((unit, i) => {
      this.pageContainer.add(this.add.sprite(width * 0.2 + i * 150, unitY, unit).setScale(2).play({ key: unit + '-run', repeat: -1 }));
    });
    this.pageContainer.add([
      this.add.text(width / 2, height * 0.15, 'BATTLE!', { fontSize: '42px', color: '#FF4444', fontStyle: 'bold' }).setOrigin(0.5),
      this.add.text(width / 2, height * 0.3, 'Your crafted units automatically march toward the enemy castle.\n\nThey fight any enemies they encounter along the way.\n\nCraft wisely and overwhelm your opponents!', { fontSize: '18px', color: '#FFFFFF', align: 'center', lineSpacing: 10 }).setOrigin(0.5),
      this.add.text(width * 0.75, unitY, '→ ENEMY CASTLE', { fontSize: '16px', color: '#FF6666', fontStyle: 'bold' }).setOrigin(0, 0.5),
    ]);
  }

  private showReadyPage(): void {
    const { width, height } = this.sys.game.config as { width: number; height: number };
    this.pageContainer.add([
      this.add.text(width / 2, height * 0.2, 'READY FOR BATTLE?', { fontSize: '48px', color: '#FFD700', fontStyle: 'bold' }).setOrigin(0.5),
      this.add.text(width / 2, height * 0.4, '💡 Quick Tips:\n\n• Use arrow keys + SPACE to arrange materials\n• Build patterns at positions 0, 2, or 4 in the bottom row\n• Press R to deploy your crafted army\n• Different unit combinations create powerful armies\n• Destroy the enemy castle to win!', { fontSize: '16px', color: '#FFFFFF', align: 'center', lineSpacing: 8 }).setOrigin(0.5),
      this.add.text(width / 2, height * 0.75, 'The realm awaits your strategic genius!\n\nGood luck, Commander!', { fontSize: '18px', color: '#CCCCCC', align: 'center', lineSpacing: 6 }).setOrigin(0.5),
    ]);
  }
}
