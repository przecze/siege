import type { StatusEffect } from '../types/StatusEffect';

export class StatusEffectManager {
  private effects: StatusEffect[] = [];

  add(effect: StatusEffect): void {
    this.effects.push(effect);
  }

  tick(): void {
    this.effects = this.effects.filter(e => {
      e.remainingFrames--;
      return e.remainingFrames > 0;
    });
  }

  getSpeedMultiplier(): number {
    return this.effects.reduce((m, e) => e.modifySpeed ? e.modifySpeed(m) : m, 1);
  }

  isMovementBlocked(): boolean {
    return this.effects.some(e => e.blockMovement?.());
  }

  isEngaged(): boolean {
    return this.isMovementBlocked();
  }
}
