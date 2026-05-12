import type { LayerName } from './LayerName';

export type MovementBehaviourId = 'ground' | 'air';
export type AttackBehaviourId = 'melee' | 'ranged' | 'summon';
export type ProjectileId = string;
export type AbilityId = string;

export interface UnitStats {
  health: number;
  speed: number;
  attackPower: number;
}

export interface UnitDefinition {
  id: string;
  textureKey: string;
  layer: LayerName;
  stats: UnitStats;
  movement: MovementBehaviourId;
  attack: AttackBehaviourId;
  projectile?: ProjectileId;
  abilities?: AbilityId[];
}
