import type { UnitDefinition } from '../../types/UnitDefinition';

export const arrowDef: UnitDefinition = {
  id: 'arrow',
  textureKey: 'arrow',
  layer: 'ground',
  stats: { health: 1, speed: 0, attackPower: 30 },
  movement: 'ground',
  attack: 'melee',
};
