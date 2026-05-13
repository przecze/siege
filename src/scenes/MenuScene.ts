import Phaser from 'phaser';
import { palette, col, text, btn, drawPanel, wireButton, addKeyGlyph } from '../theme';

interface PatternData { unit: string; pattern: string[][]; }

export class MenuScene extends Phaser.Scene {
  private currentPage = 0;
  private readonly totalPages = 7;
  private pageContainer!: Phaser.GameObjects.Container;
  private prevButton!: Phaser.GameObjects.Text;
  private nextButton!: Phaser.GameObjects.Text;
  private pageIndicator!: Phaser.GameObjects.Text;

  constructor() { super('menu'); }

  create(): void {
    const { width, height } = this.sys.game.config as { width: number; height: number };

    const gfx = this.add.graphics();
    gfx.fillStyle(col.navyDeep, 1);
    gfx.fillRect(0, 0, width, height);

    this.setupNavigation();
    this.showCurrentPage();
  }

  private setupNavigation(): void {
    const { width, height } = this.sys.game.config as { width: number; height: number };

    const skipBtn = this.add.text(width - 16, 16, 'Skip to Game', {
      ...btn.ghost.style,
    }).setOrigin(1, 0).setInteractive().on('pointerdown', () => this.scene.start('game'));
    wireButton(skipBtn, btn.ghost.hover, btn.ghost.out);

    this.input.keyboard!.on('keydown-S', () => this.scene.start('game'));

    this.prevButton = this.add.text(50, height - 36, '← Previous', {
      ...btn.secondary.style,
    }).setOrigin(0, 1).setInteractive().setVisible(false);
    wireButton(this.prevButton, btn.secondary.hover, btn.secondary.out);

    this.nextButton = this.add.text(width - 50, height - 36, 'Next →', {
      ...btn.primary.style,
    }).setOrigin(1, 1).setInteractive();
    wireButton(this.nextButton, btn.primary.hover, btn.primary.out);

    this.pageIndicator = this.add.text(width / 2, height - 36, '', {
      ...text.dim,
    }).setOrigin(0.5, 1);

    this.prevButton.on('pointerdown', () => { if (this.currentPage > 0) { this.currentPage--; this.showCurrentPage(); } });
    this.nextButton.on('pointerdown', () => {
      if (this.currentPage < this.totalPages - 1) { this.currentPage++; this.showCurrentPage(); }
      else this.scene.start('game');
    });
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
      this.add.text(width / 2, height * 0.22, 'SIEGE', {
        ...text.title, fontSize: '72px',
      }).setOrigin(0.5),
      this.add.text(width / 2, height * 0.34, 'Craft  ·  Battle  ·  Conquer', {
        fontSize: '22px', color: palette.steelLight, fontStyle: 'italic',
      }).setOrigin(0.5),
      this.add.text(width / 2, height * 0.54,
        'Welcome to SIEGE!\n\nA strategy game where you craft units\nby arranging magical materials on a grid.\n\nDifferent patterns create different troops\nto lead into battle against the enemy castle.',
        { ...text.body, align: 'center' },
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
      for (let c = 0; c < 6; c++) {
        const x = gridX + c * (cellSize + 2);
        const y = gridY + row * (cellSize + 2);
        const sprite = this.add.sprite(x, y, 'elements', Phaser.Math.RND.pick(materials)).setDisplaySize(cellSize, cellSize);
        if (row >= 3) this.pageContainer.add(this.add.rectangle(x, y, cellSize + 4, cellSize + 4).setStrokeStyle(2, col.gold, 0.8));
        if (row === 4 && c === 2) this.pageContainer.add(this.add.rectangle(x, y, cellSize + 6, cellSize + 6).setStrokeStyle(3, col.white));
        this.pageContainer.add(sprite);
      }
    }

    [0, 2, 4].forEach((pos, i) => {
      this.pageContainer.add([
        this.add.text(gridX + pos * (cellSize + 2), gridY + 5 * (cellSize + 2) + 6, '↑', { fontSize: '20px', color: palette.playerGreen, fontStyle: 'bold' }).setOrigin(0.5, 0),
        this.add.text(gridX + pos * (cellSize + 2), gridY + 5 * (cellSize + 2) + 28, `Pos ${i + 1}`, { fontSize: '12px', color: palette.playerGreen }).setOrigin(0.5, 0),
      ]);
    });

    this.pageContainer.add([
      this.add.text(width / 2, height * 0.1, 'The Crafting Grid', { ...text.heading }).setOrigin(0.5),
      this.add.text(width * 0.62, height * 0.25, 'Controls:', { ...text.subheading }).setOrigin(0, 0),
      this.add.text(width * 0.62, height * 0.53, 'BUILD ZONE:', { ...text.subheading }).setOrigin(0, 0),
      this.add.text(width * 0.62, height * 0.58,
        'Golden area = crafting zone\nStart at positions 1, 2, or 3',
        { ...text.small, lineSpacing: 3, wordWrap: { width: 200 } }).setOrigin(0, 0),
    ]);

    const kx = width * 0.62;
    const ky = height * 0.32;
    const step = 22;
    addKeyGlyph(this, this.pageContainer, kx, ky,           '↑↓←→', 'Move cursor');
    addKeyGlyph(this, this.pageContainer, kx, ky + step,    'SPC',   'Select / Swap');
    addKeyGlyph(this, this.pageContainer, kx, ky + step * 2,'R',     'Release units');
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

    this.showPattern(unitPattern, width * 0.3, height * 0.42);

    this.pageContainer.add([
      this.add.text(width / 2, height * 0.12, unitName, { ...text.heading }).setOrigin(0.5),
      this.add.sprite(width * 0.7, height * 0.45, unitKey).setScale(3).play({ key: unitKey + '-run', repeat: -1 }),
      this.add.text(width / 2, height * 0.66, pattern, { ...text.subheading, align: 'center' } ).setOrigin(0.5),
      this.add.text(width / 2, height * 0.75, description, { ...text.small, color: palette.steelLight, align: 'center' }).setOrigin(0.5),
    ]);
  }

  private showPattern(patternData: PatternData, x: number, y: number): void {
    const tileSize = 50;
    const reversed = [...patternData.pattern].reverse();
    this.pageContainer.add(this.add.text(x, y - 60, 'Pattern:', { ...text.label }).setOrigin(0.5));
    for (let row = 0; row < reversed.length; row++) {
      for (let c = 0; c < reversed[row].length; c++) {
        const sx = x + (c - reversed[0].length / 2 + 0.5) * (tileSize + 5);
        const sy = y + (row - reversed.length / 2 + 0.5) * (tileSize + 5);
        this.pageContainer.add([
          this.add.sprite(sx, sy, 'elements', reversed[row][c]).setDisplaySize(tileSize, tileSize),
          this.add.rectangle(sx, sy, tileSize, tileSize).setStrokeStyle(2, col.steel, 0.7),
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
      this.add.text(width / 2, height * 0.12, 'BATTLE!', { ...text.heading, color: palette.enemyRed }).setOrigin(0.5),
      this.add.text(width / 2, height * 0.3,
        'Your crafted units automatically march toward the enemy castle.\n\nThey fight any enemies they encounter along the way.\n\nCraft wisely and overwhelm your opponents!',
        { ...text.body, align: 'center' },
      ).setOrigin(0.5),
      this.add.text(width * 0.75, unitY, '→ ENEMY CASTLE', { ...text.small, color: palette.crimson, fontStyle: 'bold' }).setOrigin(0, 0.5),
    ]);
  }

  private showReadyPage(): void {
    const { width, height } = this.sys.game.config as { width: number; height: number };

    const gfx = this.add.graphics();
    drawPanel(gfx, width * 0.1, height * 0.28, width * 0.8, height * 0.48, 10);
    this.pageContainer.add(gfx);

    this.pageContainer.add([
      this.add.text(width / 2, height * 0.16, 'READY FOR BATTLE?', { ...text.heading }).setOrigin(0.5),
      this.add.text(width / 2, height * 0.41,
        '• Arrow keys + SPACE to arrange materials\n• Build patterns at positions 1, 2, or 3\n• Press R to deploy your crafted army\n• Mix unit types for powerful armies\n• Destroy the enemy castle to win!',
        { ...text.small, align: 'left', lineSpacing: 8 },
      ).setOrigin(0.5),
      this.add.text(width / 2, height * 0.66,
        'The realm awaits your command, Commander.',
        { ...text.small, color: palette.steelLight, fontStyle: 'italic', align: 'center' },
      ).setOrigin(0.5),
    ]);
  }
}
