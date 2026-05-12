import type { UnitDefinition } from '../../types/UnitDefinition';
import { soldierDef } from './soldier';
import { archerDef } from './archer';
import { riderDef } from './rider';

export const UNIT_DEFINITIONS: Record<string, UnitDefinition> = {
  soldier: soldierDef,
  archer: archerDef,
  rider: riderDef,
  lancer: riderDef,
};
