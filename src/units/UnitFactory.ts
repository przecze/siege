import type Phaser from 'phaser';
import type { PlayerSide } from '../types/PlayerSide';
import { UNIT_DEFINITIONS } from '../data/units/index';
import { Unit } from './Unit';

export class UnitFactory {
  static create(scene: Phaser.Scene, unitId: string, player: PlayerSide, x: number, y: number): Unit | null {
    const def = UNIT_DEFINITIONS[unitId];
    if (!def) {
      console.error(`Unknown unit id: ${unitId}`);
      return null;
    }
    return new Unit(scene, x, y, def, player);
  }
}
