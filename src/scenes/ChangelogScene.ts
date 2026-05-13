import Phaser from 'phaser';

const COOKIE_KEY = 'siege_last_seen_version';

interface ChangelogEntry { version: string; date: string; changes: string[] }

function parseSemver(v: string): number[] {
  return v.split('.').map(Number);
}

function isNewer(a: string, b: string): boolean {
  const pa = parseSemver(a);
  const pb = parseSemver(b);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff > 0;
  }
  return false;
}

function parseChangelog(md: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  let current: ChangelogEntry | null = null;

  for (const raw of md.split('\n')) {
    const line = raw.trim();
    const header = line.match(/^##\s+\[([^\]]+)\](?:\s*-\s*(.+))?/);
    if (header) {
      if (current) entries.push(current);
      current = { version: header[1], date: (header[2] ?? '').trim(), changes: [] };
      continue;
    }
    if (current && line.startsWith('- ')) {
      current.changes.push(line.slice(2));
    }
  }
  if (current) entries.push(current);
  return entries;
}

function getLastSeen(): string | null {
  const match = document.cookie.split('; ').find(r => r.startsWith(COOKIE_KEY + '='));
  return match ? match.split('=')[1] : null;
}

function markSeen(version: string): void {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `${COOKIE_KEY}=${version}; expires=${expires.toUTCString()}; path=/`;
}

export class ChangelogScene extends Phaser.Scene {
  constructor() { super('changelog'); }

  async create(): Promise<void> {
    const { width, height } = this.sys.game.config as { width: number; height: number };

    let entries: ChangelogEntry[] = [];
    try {
      const res = await fetch('/CHANGELOG.md');
      const text = await res.text();
      entries = parseChangelog(text);
    } catch {
      entries = [{ version: '?', date: '', changes: ['Could not load changelog.'] }];
    }

    const latestVersion = entries[0]?.version ?? '?';
    const lastSeen = getLastSeen();

    if (lastSeen && !isNewer(latestVersion, lastSeen)) {
      this.scene.start('menu');
      return;
    }

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRect(0, 0, width, height);

    const panelW = width * 0.78;
    const panelH = height * 0.82;
    const panelX = (width - panelW) / 2;
    const panelY = (height - panelH) / 2;

    const panel = this.add.graphics();
    panel.fillStyle(0x0a1a2e, 1);
    panel.fillRoundedRect(panelX, panelY, panelW, panelH, 12);
    panel.lineStyle(2, 0xFFD700, 0.8);
    panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 12);

    this.add.text(width / 2, panelY + 28, "What's New", {
      fontSize: '28px', fontStyle: 'bold', color: '#FFD700',
    }).setOrigin(0.5, 0);

    this.add.text(width / 2, panelY + 60, `Version ${latestVersion}`, {
      fontSize: '14px', color: '#888888',
    }).setOrigin(0.5, 0);

    let y = panelY + 96;
    const contentX = panelX + 28;
    const contentW = panelW - 56;

    for (const entry of entries) {
      const header = entry.date ? `v${entry.version}  ·  ${entry.date}` : `v${entry.version}`;
      this.add.text(contentX, y, header, {
        fontSize: '15px', fontStyle: 'bold', color: '#FFD700',
      });
      y += 24;

      for (const change of entry.changes) {
        this.add.text(contentX + 8, y, `• ${change}`, {
          fontSize: '14px', color: '#DDDDDD', wordWrap: { width: contentW - 16 },
        });
        y += 22;
      }
      y += 14;
    }

    const btn = this.add.text(width / 2, panelY + panelH - 28, "Let's play!", {
      fontSize: '18px', fontStyle: 'bold', color: '#FFFFFF',
      backgroundColor: '#006600', padding: { x: 28, y: 10 },
    }).setOrigin(0.5, 1).setInteractive();

    btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#008800' }));
    btn.on('pointerout',  () => btn.setStyle({ backgroundColor: '#006600' }));
    btn.on('pointerdown', () => {
      markSeen(latestVersion);
      this.scene.start('menu');
    });
  }
}
