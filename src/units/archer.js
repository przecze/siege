import { Unit } from './Unit';
import { archerDef } from '../data/units/archer';
import { eventBus } from '../events/EventBus';

export default class Archer extends Unit {
  constructor(scene, x, y, player) {
    super(scene, x, y, archerDef, player);

    this.startingX = x;
    this.ARCHER_WALKOUT = 150;
    this.arrowCooldown = 0;
    this.remainingArrows = 5;
  }

  shouldShoot() {
    if (this.remainingArrows === 0) return false;
    return (
      (this.player === 'L' && this.x > this.startingX + this.ARCHER_WALKOUT) ||
      (this.player === 'R' && this.x < this.startingX - this.ARCHER_WALKOUT)
    );
  }

  update() {
    if (this.shouldShoot()) {
      this.isEngaged = true;
    }
    if (
      this.remainingArrows > 0 &&
      this.anims.currentAnim?.key === 'archer-attack' &&
      this.anims.currentFrame.index === 6 &&
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
