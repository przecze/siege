export interface StatusEffect {
  id: string;
  remainingFrames: number;
  modifySpeed?(base: number): number;
  blockMovement?(): boolean;
}
