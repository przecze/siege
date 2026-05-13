import type Phaser from 'phaser';

// Hex strings (for Phaser text color/backgroundColor)
export const palette = {
  // Base
  ink:          '#1f1a1a',  // near-black outline — dominant in all unit sprites
  navy:         '#001122',
  navyDeep:     '#000a14',
  navyMid:      '#001833',
  navyLight:    '#002244',

  // Accents — from unit sprites
  gold:         '#FFD700',  // craft border, titles
  goldDim:      '#8B6914',
  steel:        '#607581',  // armor (soldier/lancer dominant)
  steelLight:   '#9badb7',
  crimson:      '#6b1a11',  // cloaks — all three units
  leather:      '#94644c',  // lancer horse/saddle

  // UI text
  white:        '#ffffff',
  offWhite:     '#dddddd',
  muted:        '#888888',
  dimmed:       '#555555',

  // Semantic
  playerGreen:  '#44bb55',
  enemyRed:     '#cc3333',
} as const;

// Numeric versions (for Phaser Graphics fillStyle / lineStyle)
export const col = {
  navy:         0x001122,
  navyDeep:     0x000a14,
  navyMid:      0x001833,
  navyLight:    0x002244,
  gold:         0xFFD700,
  steel:        0x607581,
  steelLight:   0x9badb7,
  crimson:      0x6b1a11,
  white:        0xffffff,
  playerGreen:  0x44bb55,
  enemyRed:     0xcc3333,
} as const;

// Reusable text styles
type TS = Phaser.Types.GameObjects.Text.TextStyle;

export const text = {
  title:      { fontSize: '48px', fontStyle: 'bold', color: palette.gold,
                stroke: palette.ink, strokeThickness: 4 } as TS,
  heading:    { fontSize: '28px', fontStyle: 'bold', color: palette.gold } as TS,
  subheading: { fontSize: '18px', fontStyle: 'bold', color: palette.steelLight } as TS,
  body:       { fontSize: '18px', color: palette.offWhite, lineSpacing: 8 } as TS,
  small:      { fontSize: '14px', color: palette.offWhite, lineSpacing: 4 } as TS,
  dim:        { fontSize: '14px', color: palette.muted } as TS,
  label:      { fontSize: '13px', color: palette.steel } as TS,
  timer:      { fontSize: '22px', fontStyle: 'bold', color: palette.gold } as TS,
} as const;

// Button style factories (returns style + hover bg color string)
export const btn = {
  primary: {
    style: { fontSize: '18px', fontStyle: 'bold', color: palette.white,
             backgroundColor: '#2a5c2a', padding: { x: 24, y: 10 } } as TS,
    hover: '#3a7a3a',
    out:   '#2a5c2a',
  },
  secondary: {
    style: { fontSize: '16px', color: palette.offWhite,
             backgroundColor: '#2a3040', padding: { x: 18, y: 8 } } as TS,
    hover: '#3a4060',
    out:   '#2a3040',
  },
  ghost: {
    style: { fontSize: '14px', color: palette.muted,
             backgroundColor: '#1a2030', padding: { x: 12, y: 6 } } as TS,
    hover: '#2a3040',
    out:   '#1a2030',
  },
} as const;

// Draw a navy panel with gold border onto a Graphics object
export function drawPanel(
  gfx: Phaser.GameObjects.Graphics,
  x: number, y: number, w: number, h: number,
  radius = 10,
): void {
  gfx.fillStyle(col.navyDeep, 0.92);
  gfx.fillRoundedRect(x, y, w, h, radius);
  gfx.lineStyle(1.5, col.gold, 0.55);
  gfx.strokeRoundedRect(x, y, w, h, radius);
}

// Thin separator line
export function drawSeparator(
  gfx: Phaser.GameObjects.Graphics,
  x: number, y: number, w: number,
): void {
  gfx.lineStyle(1, col.gold, 0.25);
  gfx.beginPath();
  gfx.moveTo(x, y);
  gfx.lineTo(x + w, y);
  gfx.strokePath();
}

// Render a keyboard key cap + label, added into the given container
export function addKeyGlyph(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  x: number,
  y: number,
  key: string,
  label: string,
): void {
  const keyW = key.length > 1 ? 26 : 18;
  const keyH = 18;

  const gfx = scene.add.graphics();
  gfx.fillStyle(0x1a2535, 1);
  gfx.fillRoundedRect(x, y, keyW, keyH, 3);
  gfx.lineStyle(1, col.steel, 0.8);
  gfx.strokeRoundedRect(x, y, keyW, keyH, 3);
  gfx.lineStyle(2, 0x0a1020, 0.9);
  gfx.beginPath();
  gfx.moveTo(x + 2, y + keyH);
  gfx.lineTo(x + keyW - 2, y + keyH);
  gfx.strokePath();

  const keyText = scene.add.text(x + keyW / 2, y + keyH / 2, key, {
    fontSize: '11px', fontStyle: 'bold', color: palette.steelLight,
    fontFamily: 'monospace',
  }).setOrigin(0.5, 0.5);

  const labelText = scene.add.text(x + keyW + 5, y + keyH / 2, label, {
    fontSize: '12px', color: palette.muted,
  }).setOrigin(0, 0.5);

  container.add([gfx, keyText, labelText]);
}

// Wire hover/out events onto an interactive Phaser Text button
export function wireButton(
  t: Phaser.GameObjects.Text,
  hoverBg: string,
  outBg: string,
): void {
  t.on('pointerover', () => t.setStyle({ backgroundColor: hoverBg }));
  t.on('pointerout',  () => t.setStyle({ backgroundColor: outBg }));
}
