import type { LayerName } from './LayerName';
import type { ProjectileId } from './UnitDefinition';

export type TrajectoryId = 'straight' | 'parabolic' | 'homing';

export interface ProjectileDefinition {
  id: ProjectileId;
  textureKey: string;
  trajectory: TrajectoryId;
  speed: number;
  damage: number;
  damageRadius: number;
  targetLayers: LayerName[];
}
