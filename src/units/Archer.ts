import { Unit } from './Unit';
import { archerDef } from '../data/units/archer';
import { eventBus } from '../events/EventBus';
import type { PlayerSide } from '../types/PlayerSide';

export class Archer extends Unit {
  private startingX: number;
  private readonly ARCHER_WALKOUT = 150;
  private arrowCooldown = 0;
  private remainingArrows = 5;

  constructor(scene: Phaser.Scene, x: number, y: number, player: PlayerSide) {
    super(scene, x, y, archerDef, player);
    this.startingX = x;
  }

  private shouldShoot(): boolean {
    if (this.remainingArrows === 0) return false;
    return (
      (this.player === 'L' && this.x > this.startingX + this.ARCHER_WALKOUT) ||
      (this.player === 'R' && this.x < this.startingX - this.ARCHER_WALKOUT)
    );
  }

  update(): void {
    if (this.shouldShoot()) this.isEngaged = true;

    if (
      this.remainingArrows > 0 &&
      this.anims.currentAnim?.key === 'archer-attack' &&
      this.anims.currentFrame?.index === 6 &&
      this.arrowCooldown >= 30
    ) {
      eventBus.emit('PROJECTILE_SPAWN', { projectileId: 'arrow', x: this.x, y: this.y, player: this.player });
      this.arrowCooldown = 0;
      this.remainingArrows--;
    }
    this.arrowCooldown++;
    super.update();
  }
}
