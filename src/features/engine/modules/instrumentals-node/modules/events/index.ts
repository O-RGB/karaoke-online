import { EventKey } from "../types/node.type";

export class EventManager<T> {
  public callbacks: Map<string, ((event: T) => void)[]> = new Map();

  constructor() {}

  private generateKey(eventType: EventKey, channel: number): string {
    return `${eventType.join("-")}-${channel}`;
  }

  add(
    eventType: EventKey,
    channel: number,
    callback: (event: T) => void
  ): void {
    const key = this.generateKey(eventType, channel);

    if (!this.callbacks.has(key)) {
      this.callbacks.set(key, []);
    }
    this.callbacks.get(key)?.push(callback);
  }

  remove(
    eventType: EventKey,
    channel: number,
    callback: (event: T) => void
  ): boolean {
    const key = this.generateKey(eventType, channel);

    if (this.callbacks.has(key)) {
      const list = this.callbacks.get(key);
      if (list) {
        const index = list.indexOf(callback);
        if (index !== -1) {
          list.splice(index, 1);
          return true;
        }
      }
    }
    return false;
  }

  trigger(eventType: EventKey, channel: number, eventContent: T): void {
    const key = this.generateKey(eventType, channel);
    this.callbacks.get(key)?.forEach((callback) => callback(eventContent));
  }
}
