# Siege — TypeScript Architecture Proposal

## Context
Current stack: Phaser 3.90 + Vite, plain JS, 3 unit types, flat OOP. The user wants a solid architectural foundation before expanding to ~20 units, local multiplayer, AI, flying units, projectile variety, status effects, and summoning. No implementation yet — this is the design baseline.

---

## Decision 1: Phaser Only (No React)

Keep Phaser for everything. The game canvas owns 100% of the visible area; React would add a second render tree and event system for no gameplay gain.

**Exception carve-out**: If a future feature needs a form or scrollable list (e.g., unit unlock screen), mount a React root into a `<div id="ui-root">` above the canvas via CSS `position: absolute`. The two talk through the EventBus (see Decision 5). This requires zero upfront work — just an architectural boundary to respect.

---

## Decision 2: Data-Driven Units (No 20-Class Files)

One `Unit` class + one typed `UnitDefinition` object per unit type. Behavior differences live in composable strategy objects.

```typescript
interface UnitDefinition {
  id: string;
  textureKey: UnitTextureKey;
  layer: 'ground' | 'air';
  stats: { health: number; speed: number; attackPower: number };
  movement: MovementBehaviourId;
  attack: AttackBehaviourId;
  projectile?: ProjectileId;
  abilities?: AbilityId[];
  craftPattern: ElementColor[][];
}
```

Adding a unit = adding one file in `src/data/units/`. No new classes, no new imports in Battlefield.

---

## Decision 3: Two-Layer Collision Model

Four Phaser groups total (groundGroup + airGroup per player side).

Collision matrix:
- Ground ↔ Ground (enemy): blocks + damages
- Ground ↔ Air (enemy): no block, no damage (unless ranged)
- Air ↔ Ground (enemy): no block, damages (if downward attack)
- Air ↔ Air (enemy): blocks + damages
- Projectile ↔ any: damage by `targetLayers[]` on `ProjectileDefinition`

"Phase through single enemy" = a `StatusEffect` tag that skips the movement-stop side of collision while still exchanging damage. Air units render at higher Phaser `depth` — no second camera needed.

---

## Decision 4: Input Abstraction

`IInputController` interface, implemented by `KeyboardController`, `AIController`, `TouchController`. Game only calls `controller.getActions()`.

```typescript
interface PlayerActions {
  moveCursor: { dx: number; dy: number } | null;
  confirmSwap: boolean;
  sendTroops: boolean;
}
```

Local multiplayer = two `KeyboardController` instances with different key bindings. AI = `AIController` that reads a read-only `BattlefieldView` and emits `PlayerActions` with simulated latency. `Grid` accepts a controller reference — no keyboard reads directly in game scenes.

---

## Decision 5: EventBus for Cross-System Communication

Typed event union. Emitters have no imports of receivers.

```typescript
type GameEvent =
  | { type: 'UNIT_DIED'; unit: Unit }
  | { type: 'PROJECTILE_SPAWN'; projectileId: string; x: number; y: number; player: PlayerSide }
  | { type: 'CASTLE_DAMAGED'; player: PlayerSide; amount: number }
  | { type: 'UNIT_SPAWN_REQUESTED'; unitId: string; player: PlayerSide }
  | { type: 'STATUS_EFFECT_APPLIED'; targetId: string; effectId: string };
```

Current problem: `Archer` calls `this.scene.battlefield.spawnArrow()` directly. After migration: `Archer` emits `PROJECTILE_SPAWN`. `Battlefield` listens and creates it. Zero coupling.

---

## Decision 6: StatusEffectManager on Each Unit

Replaces the current `isEngaged` boolean hack. Each `Unit` holds a `StatusEffectManager`.

```typescript
interface StatusEffect {
  id: string;
  remainingFrames: number;
  modifySpeed?(base: number): number;
  blockMovement?(): boolean;
}
```

`Unit.update()` queries its manager:
```typescript
this.statusEffects.tick();
const speed = this.def.stats.speed * this.statusEffects.getSpeedMultiplier();
if (!this.statusEffects.isMovementBlocked()) { this.x += speed * dir; }
```

Slow = `modifySpeed` returns 0.5. Stop = `blockMovement` returns true. Phase = permanent tag checked in collision resolver.

---

## Decision 7: Projectile TrajectoryStrategy

`Projectile` is its own class (not a `Unit` subclass). Trajectory is injected.

```typescript
interface TrajectoryStrategy {
  update(p: Projectile, dt: number): { x: number; y: number };
  hasReachedTarget(p: Projectile): boolean;
}
// Implementations: StraightTrajectory, ParabolicTrajectory, HomingTrajectory
```

`onImpact()` checks `ProjectileDefinition.damageRadius` — 0 = single target, >0 = AoE circle query on affected layers.

---

## Decision 8: Typed AssetRegistry

Replaces inline asset loads in GameScene. Single source of truth for texture keys.

```typescript
export const UNIT_ASSETS = {
  soldier: { png: '...', json: '...' },
  lancer:  { png: '...', json: '...' },
} as const satisfies Record<string, AsepriteAsset>;

export type UnitTextureKey = keyof typeof UNIT_ASSETS;
```

`BootScene` iterates this registry to call `load.aseprite()`. `UnitDefinition.textureKey` is typed `UnitTextureKey` — missing asset = compile error.

---

## Directory Structure

```
src/
  assets/
    AssetRegistry.ts          ← all texture keys + paths
    AnimationRegistry.ts      ← textureKey → animation config
  data/
    units/                    ← UnitDefinition per unit (soldier.ts, archer.ts, …)
    projectiles/              ← ProjectileDefinition per type
    patterns/unitPatterns.ts  ← replaces unitPatterns.json
  units/
    Unit.ts                   ← single class, data-driven
    UnitFactory.ts
    StatusEffectManager.ts
    behaviours/
      IMovementBehaviour.ts
      GroundMovement.ts, AirMovement.ts
      IAttackBehaviour.ts
      MeleeAttack.ts, RangedAttack.ts, SummonBehaviour.ts
  projectiles/
    Projectile.ts
    ProjectileFactory.ts
    trajectories/
      StraightTrajectory.ts, ParabolicTrajectory.ts, HomingTrajectory.ts
  input/
    IInputController.ts
    KeyboardController.ts, AIController.ts, TouchController.ts
    InputBinding.ts           ← maps player side → controller + key bindings
  battlefield/
    Battlefield.ts
    BattlefieldLayers.ts      ← ground/air group management
    CombatResolver.ts         ← collision + damage, extracted from Battlefield
  components/
    Grid.ts, PatternMatcher.ts, UnitPatternAtlas.ts, HealthTracker.ts
  events/
    EventBus.ts, GameEvents.ts
  scenes/
    BootScene.ts, MenuScene.ts, GameScene.ts
  types/
    UnitDefinition.ts, ProjectileDefinition.ts, StatusEffect.ts
    PlayerSide.ts, LayerName.ts
  index.ts
```

---

## Migration Path (JS → TS, incremental)

1. Add TS to Vite (`vite.config.ts`, `tsconfig.json`) — Vite handles `.ts` and `.js` side-by-side
2. `src/types/` + `src/events/` — pure declarations, no runtime risk
3. `AssetRegistry.ts` — catches import errors early across the codebase
4. `Unit.ts` + one `UnitDefinition` — validates data-driven approach with real unit behavior
5. `Battlefield.ts` — most complex, do last among core files
6. Scenes last — most side effects

Each step ships and runs before the next begins.

---

## Feature Readiness

| Feature | Mechanism |
|---|---|
| 20 unit types | `UnitDefinition` files + `UnitFactory` |
| Flying units / air layer | `BattlefieldLayers`, `layer` field |
| Projectile trajectories | `TrajectoryStrategy` + `ProjectileFactory` |
| AoE explosions | `damageRadius` on `ProjectileDefinition` |
| Summoning units | `SummonBehaviour` emitting `UNIT_SPAWN_REQUESTED` |
| Status effects (slow/stop/phase) | `StatusEffectManager` on each `Unit` |
| Local multiplayer | Two `KeyboardController` instances via `InputBinding` |
| AI opponent | `AIController` implementing `IInputController` |
| React UI overlay (future) | React root subscribing to `EventBus` |

---

## Critical Files to Transform First

- [src/units/unit.js](../../../bluh-backup/projects/siege/src/units/unit.js) — becomes `Unit.ts`, restructured around `UnitDefinition`
- [src/components/battlefield.js](../../../bluh-backup/projects/siege/src/components/battlefield.js) — split into `Battlefield.ts` + `CombatResolver.ts` + `BattlefieldLayers.ts`
- [src/scenes/game.js](../../../bluh-backup/projects/siege/src/scenes/game.js) — input abstraction + asset registry wired here
- [src/units/archer.js](../../../bluh-backup/projects/siege/src/units/archer.js) — canonical example of cross-system coupling to fix via EventBus
- [public/data/unitPatterns.json](../../../bluh-backup/projects/siege/public/data/unitPatterns.json) — replaced by typed `src/data/patterns/unitPatterns.ts`
