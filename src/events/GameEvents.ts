import type { PlayerSide } from '../types/PlayerSide';

export type GameEvent =
  | { type: 'UNIT_DIED'; unitId: string }
  | { type: 'PROJECTILE_SPAWN'; projectileId: string; x: number; y: number; player: PlayerSide }
  | { type: 'CASTLE_DAMAGED'; player: PlayerSide; amount: number }
  | { type: 'UNIT_SPAWN_REQUESTED'; unitId: string; player: PlayerSide }
  | { type: 'STATUS_EFFECT_APPLIED'; targetId: string; effectId: string };

export type GameEventType = GameEvent['type'];

export type GameEventOf<T extends GameEventType> = Extract<GameEvent, { type: T }>;
