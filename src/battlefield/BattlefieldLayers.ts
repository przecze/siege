import type { Unit } from '../units/Unit';
import type { PlayerSide } from '../types/PlayerSide';

export interface Castle {
  x: number;
  health: number;
}

export class BattlefieldLayers {
  units: Unit[] = [];

  add(unit: Unit): void {
    this.units.push(unit);
  }

  update(): void {
    this.units.forEach(u => u.update());
  }

  removeDestroyed(): void {
    this.units = this.units.filter(u => !u.destroyed);
  }

  checkCastleReach(
    enemyCastleX: number,
    onReach: (player: PlayerSide, damage: number) => void,
  ): void {
    this.units.forEach(unit => {
      if (unit.player === 'L' && unit.x >= enemyCastleX - 10) {
        onReach('L', unit.health);
        unit.destroy();
      } else if (unit.player === 'R' && unit.x <= 10) {
        onReach('R', unit.health);
        unit.destroy();
      }
    });
  }
}
