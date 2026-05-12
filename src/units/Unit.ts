import Phaser from 'phaser';
import type { UnitDefinition } from '../types/UnitDefinition';
import type { PlayerSide } from '../types/PlayerSide';
import { StatusEffectManager } from './StatusEffectManager';
import { HealthBar } from './HealthBar';

export class Unit extends Phaser.GameObjects.Sprite {
  readonly def: UnitDefinition;
  readonly player: PlayerSide;

  health: number;
  speed: number;
  attackPower: number;
  destroyed: boolean = false;

  // Set true each collision frame by the combat resolver; reset at end of update()
  isEngaged: boolean = false;

  readonly statusEffects: StatusEffectManager;

  private healthBar?: HealthBar;

  constructor(scene: Phaser.Scene, x: number, y: number, def: UnitDefinition, player: PlayerSide) {
    super(scene, x, y, def.textureKey);

    this.def = def;
    this.player = player;
    this.statusEffects = new StatusEffectManager();

    this.health = def.stats.health;
    this.attackPower = def.stats.attackPower;
    this.speed = player === 'R' ? -def.stats.speed : def.stats.speed;

    if (player === 'R') this.flipX = !this.flipX;

    this.setScale(3);

    const healthBarWidth = this.displayWidth * 0.8;
    this.healthBar = new HealthBar(
      scene,
      this.x - healthBarWidth / 2,
      this.y - this.displayHeight / 2 - 5,
      healthBarWidth,
      10,
    );

    scene.add.existing(this);
  }

  update(): void {
    this.statusEffects.tick();

    const speed = this.speed * this.statusEffects.getSpeedMultiplier();

    if (!this.isEngaged && !this.statusEffects.isMovementBlocked()) {
      this.anims.play(this.def.textureKey + '-run', true);
      this.x += speed;
    } else {
      this.anims.play(this.def.textureKey + '-attack', true);
    }

    this.isEngaged = false;

    const healthBarWidth = this.displayWidth * 0.8;
    this.healthBar?.update(
      this.x - healthBarWidth / 2,
      this.y - this.displayHeight / 2 - 5,
    );
  }

  takeDamage(damage: number): void {
    this.health -= damage;
    this.healthBar?.decrease(damage);
    if (this.health <= 0) {
      this.health = 0;
      this.destroyed = true;
    }
  }

  destroy(): void {
    super.destroy();
    this.healthBar?.destroy();
    this.destroyed = true;
  }

  isDead(): boolean {
    return this.destroyed;
  }
}
