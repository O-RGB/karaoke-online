import { EventKey } from "../types/node.type";

export class EventManager<K = any, R = any> {
  public callbacks: Map<string, ((event: R) => void)[]> = new Map();

  private generateKey(eventKey: EventKey<K>, index: number): string {
    return `${eventKey.join("-")}-${index}`;
  }

  add(
    eventKey: EventKey<K>,
    index: number,
    callback: (event: R) => void
  ): void {
    const key = this.generateKey(eventKey, index);

    if (!this.callbacks.has(key)) {
      this.callbacks.set(key, []);
    }
    this.callbacks.get(key)?.push(callback);
  }

  remove(
    eventKey: EventKey<K>,
    index: number,
    callback: (event: R) => void
  ): boolean {
    const key = this.generateKey(eventKey, index);

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

  trigger(eventKey: EventKey<K>, index: number, eventContent: R): void {
    const key = this.generateKey(eventKey, index);
    this.callbacks.get(key)?.forEach((callback) => callback(eventContent));
  }
}
