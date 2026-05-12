import Phaser from 'phaser';
import type { Unit } from '../units/Unit';
import { UnitFactory } from '../units/UnitFactory';
import { BattlefieldLayers } from './BattlefieldLayers';
import { CombatResolver } from './CombatResolver';
import { eventBus } from '../events/EventBus';
import Archer from '../units/archer';
import Arrow from '../units/arrow';

export class Battlefield {
  readonly enemyCastle: { x: number; health: number };
  playerHealth: number;
  timer: number;
  gameOver: boolean = false;

  private scene: Phaser.Scene;
  private layers: BattlefieldLayers;
  private resolver: CombatResolver;
  private spawnEnemyTimer: Phaser.Time.TimerEvent | null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.layers = new BattlefieldLayers();
    this.resolver = new CombatResolver();

    this.enemyCastle = { x: (scene.sys.game.config.width as number) - 50, health: 1000 };
    this.playerHealth = 1000;
    this.timer = 100;

    this.spawnEnemyTimer = scene.time.addEvent({
      delay: 3000,
      callback: this.spawnEnemyUnit,
      callbackScope: this,
      loop: true,
    });

    eventBus.on('PROJECTILE_SPAWN', ({ projectileId, x, y, player }) => {
      if (projectileId === 'arrow') this.spawnUnit('arrow', player, x, y);
    });
  }

  private spawnEnemyUnit(): void {
    if (this.gameOver) return;
    const rand = Math.random();
    if (rand < 0.2)      this.spawnUnit('lancer',  'R');
    else if (rand < 0.7) this.spawnUnit('soldier', 'R');
    else                 this.spawnUnit('archer',  'R');
  }

  updateDifficulty(difficulty: number): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (this.spawnEnemyTimer) (this.spawnEnemyTimer as any).delay = 5000 - 300 * difficulty;
  }

  spawnUnit(unitId: string, player: 'L' | 'R', x?: number, y?: number): void {
    const resolvedX = x ?? (player === 'L'
      ? Math.floor(Math.random() * 30)
      : this.enemyCastle.x - Math.floor(Math.random() * 30));
    const resolvedY = y ?? (this.scene.sys.game.config.height as number) * 5 / 6;

    let unit: Unit | null = null;

    if (unitId === 'archer') {
      unit = new Archer(this.scene, resolvedX, resolvedY, player) as unknown as Unit;
    } else if (unitId === 'arrow') {
      unit = new Arrow(this.scene, resolvedX, resolvedY, player) as unknown as Unit;
    } else {
      unit = UnitFactory.create(this.scene, unitId, player, resolvedX, resolvedY);
    }

    if (unit) this.layers.add(unit);
  }

  update(): void {
    this.resolver.resolve(this.layers.units);
    this.layers.update();
    this.layers.checkCastleReach(this.enemyCastle.x, (player, damage) => {
      if (player === 'L') this.enemyCastle.health -= damage;
      else                this.playerHealth -= damage;
    });
    this.layers.removeDestroyed();

    this.timer = Math.max(this.timer - (this.scene.game.loop.delta / 1000), 0);

    this.gameOver =
      this.enemyCastle.health <= 0 ||
      this.playerHealth <= 0 ||
      this.timer <= 0;

    if (this.gameOver && this.spawnEnemyTimer) {
      this.spawnEnemyTimer.remove();
      this.spawnEnemyTimer = null;
    }
  }
}
