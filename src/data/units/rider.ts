import type { UnitDefinition } from '../../types/UnitDefinition';

export const riderDef: UnitDefinition = {
  id: 'rider',
  textureKey: 'lancer',
  layer: 'ground',
  stats: { health: 80, speed: 4, attackPower: 3 },
  movement: 'ground',
  attack: 'melee',
};
