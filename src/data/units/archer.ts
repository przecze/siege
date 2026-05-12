import type { UnitDefinition } from '../../types/UnitDefinition';

export const archerDef: UnitDefinition = {
  id: 'archer',
  textureKey: 'archer',
  layer: 'ground',
  stats: { health: 30, speed: 0.5, attackPower: 1 },
  movement: 'ground',
  attack: 'ranged',
  projectile: 'arrow',
};
