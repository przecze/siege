import type { GameEvent, GameEventOf, GameEventType } from './GameEvents';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyListener = (event: any) => void;

class EventBus {
  private listeners = new Map<GameEventType, AnyListener[]>();

  on<T extends GameEventType>(type: T, listener: (event: GameEventOf<T>) => void): void {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type)!.push(listener);
  }

  off<T extends GameEventType>(type: T, listener: (event: GameEventOf<T>) => void): void {
    const list = this.listeners.get(type);
    if (list) this.listeners.set(type, list.filter(l => l !== listener));
  }

  emit<T extends GameEventType>(type: T, payload: Omit<GameEventOf<T>, 'type'>): void {
    const event = { type, ...payload } as unknown as GameEvent;
    this.listeners.get(type)?.forEach(l => l(event));
  }
}

export const eventBus = new EventBus();
