import type { UnitDefinition } from '../../types/UnitDefinition';

export const soldierDef: UnitDefinition = {
  id: 'soldier',
  textureKey: 'soldier',
  layer: 'ground',
  stats: { health: 100, speed: 2, attackPower: 1 },
  movement: 'ground',
  attack: 'melee',
};
