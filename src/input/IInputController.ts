export interface PlayerActions {
  moveCursor: { dx: number; dy: number } | null;
  confirmSwap: boolean;
  sendTroops: boolean;
}

export interface IInputController {
  getActions(): PlayerActions;
}
