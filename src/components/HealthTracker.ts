import Phaser from 'phaser';
import { palette, text, addKeyGlyph, drawPanel, drawSeparator } from '../theme';

export class HealthTracker extends Phaser.GameObjects.Container {
  private playerHealthText: Phaser.GameObjects.Text;
  private enemyHealthText: Phaser.GameObjects.Text;
  private timerText: Phaser.GameObjects.Text;
  private currentDifficultyText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, playerHealth: number, enemyHealth: number, timer: number) {
    super(scene, x, y);

    // Middle third only — symmetric with right player's grid slot
    const panelW = (scene.sys.game.config.width as number) / 3 - 4;
    const panelH = 104;

    const bg = scene.add.graphics();
    drawPanel(bg, 0, 0, panelW, panelH, 6);
    drawSeparator(bg, 12, 42, panelW - 24);
    this.add(bg);

    this.playerHealthText = new Phaser.GameObjects.Text(
      scene, 14, 8, `♥ ${playerHealth}`, {
        fontSize: '20px', fontStyle: 'bold', color: palette.playerGreen,
      },
    );

    this.timerText = new Phaser.GameObjects.Text(
      scene, panelW / 2, 6, `${timer}`, {
        ...text.timer, fontSize: '24px',
      },
    ).setOrigin(0.5, 0);

    this.enemyHealthText = new Phaser.GameObjects.Text(
      scene, panelW - 14, 8, `${enemyHealth} ♥`, {
        fontSize: '20px', fontStyle: 'bold', color: palette.enemyRed, align: 'right',
      },
    ).setOrigin(1, 0);

    const row1y = 50;
    const row2y = 72;
    addKeyGlyph(scene, this, 14,          row1y, 'R',   'Deploy');
    addKeyGlyph(scene, this, panelW / 2,  row1y, 'P',   'Pause');
    addKeyGlyph(scene, this, 14,          row2y, 'V',   'Units');
    addKeyGlyph(scene, this, panelW / 2,  row2y, '-/+', 'Difficulty');

    this.currentDifficultyText = new Phaser.GameObjects.Text(
      scene, panelW - 14, row2y + 9,
      `${(scene as Phaser.Scene & { difficulty?: number }).difficulty ?? ''}`,
      { fontSize: '12px', fontStyle: 'bold', color: palette.steelLight },
    ).setOrigin(1, 0.5);

    this.add([
      this.playerHealthText,
      this.timerText,
      this.enemyHealthText,
      this.currentDifficultyText,
    ]);
    scene.add.existing(this);
  }

  updatePlayerHealth(value: number): void { this.playerHealthText.setText(`♥ ${value}`); }
  updateEnemyHealth(value: number): void   { this.enemyHealthText.setText(`${value} ♥`); }
  updateDifficulty(value: number): void    { this.currentDifficultyText.setText(`${value}`); }
  updateTimer(value: string): void         { this.timerText.setText(value); }
}
