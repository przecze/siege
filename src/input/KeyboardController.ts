import Phaser from 'phaser';
import type { IInputController, PlayerActions } from './IInputController';

export interface KeyBindings {
  left: string;
  right: string;
  up: string;
  down: string;
  swap: string;
  sendTroops: string;
}

export const DEFAULT_BINDINGS: KeyBindings = {
  left: 'LEFT',
  right: 'RIGHT',
  up: 'UP',
  down: 'DOWN',
  swap: 'SPACE',
  sendTroops: 'R',
};

export class KeyboardController implements IInputController {
  private actions: PlayerActions = { moveCursor: null, confirmSwap: false, sendTroops: false };

  constructor(scene: Phaser.Scene, bindings: KeyBindings = DEFAULT_BINDINGS) {
    const kb = scene.input.keyboard!;

    kb.on(`keydown-${bindings.left}`,       () => { this.actions.moveCursor = { dx: -1, dy: 0 }; });
    kb.on(`keydown-${bindings.right}`,      () => { this.actions.moveCursor = { dx:  1, dy: 0 }; });
    kb.on(`keydown-${bindings.up}`,         () => { this.actions.moveCursor = { dx: 0, dy: -1 }; });
    kb.on(`keydown-${bindings.down}`,       () => { this.actions.moveCursor = { dx: 0, dy:  1 }; });
    kb.on(`keydown-${bindings.swap}`,       () => { this.actions.confirmSwap = true; });
    kb.on(`keydown-${bindings.sendTroops}`, () => { this.actions.sendTroops = true; });
  }

  getActions(): PlayerActions {
    const snapshot = { ...this.actions };
    // Reset one-shot actions after reading
    this.actions.moveCursor = null;
    this.actions.confirmSwap = false;
    this.actions.sendTroops = false;
    return snapshot;
  }
}
