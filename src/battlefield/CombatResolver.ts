import Phaser from 'phaser';
import type { Unit } from '../units/Unit';

export class CombatResolver {
  resolve(units: Unit[]): void {
    for (let i = 0; i < units.length; i++) {
      for (let j = i + 1; j < units.length; j++) {
        if (units[i].player === units[j].player) continue;
        if (!Phaser.Geom.Intersects.RectangleToRectangle(
          units[i].getBounds(),
          units[j].getBounds(),
        )) continue;

        const unit1 = units[i];
        const unit2 = units[j];
        unit1.isEngaged = true;
        unit2.isEngaged = true;
        unit1.takeDamage(unit2.attackPower);
        unit2.takeDamage(unit1.attackPower);

        if (unit1.isDead()) {
          unit1.destroy();
          unit2.isEngaged = false;
          units.splice(i, 1);
          i--;
          if (unit2.isDead()) {
            unit2.destroy();
            units.splice(j - 1, 1);
          }
          break;
        }

        if (unit2.isDead()) {
          unit2.destroy();
          unit1.isEngaged = false;
          units.splice(j, 1);
          j--;
        }
      }
    }
  }
}
