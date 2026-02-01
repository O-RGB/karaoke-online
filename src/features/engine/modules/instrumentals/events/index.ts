import { EventKey } from "../types/node.type";

export class EventEmitter<K = any, R = any> {
  public listeners: Map<
    string,
    { listenerId: string; callback: (event: R) => void }[]
  > = new Map();

  public lastValue: Map<string, R> = new Map();

  public debug: boolean = false;
  public debugName?: string;

  private makeKey(eventKey: EventKey<K>, index: number): string {
    return `${eventKey.join("-")}-${index}`;
  }

  enableDebug(enable: boolean, debugName?: string) {
    this.debug = enable;
    this.debugName = debugName;
  }

  on(
    eventKey: EventKey<K>,
    index: number,
    callback: (event: R) => void,
    listenerId: string
  ): void {
    const key = this.makeKey(eventKey, index);

    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }

    const existing = this.listeners
      .get(key)
      ?.find((i) => i.listenerId === listenerId);

    if (!existing) {
      this.listeners.get(key)?.push({ listenerId, callback });

      if (this.debug) {
        console.log(this.debugName, "New listener:", listenerId);
      }
    }

    if (this.lastValue.has(key)) {
      const value = this.lastValue.get(key);
      if (value !== undefined) {
        callback(value);
      }
    }
  }

  off(eventKey: EventKey<K>, index: number, listenerId: string): boolean {
    const key = this.makeKey(eventKey, index);

    const items = this.listeners.get(key);
    if (!items) return false;

    const before = items.length;
    const filtered = items.filter((i) => i.listenerId !== listenerId);

    this.listeners.set(key, filtered);

    if (this.debug && before !== filtered.length) {
      console.log(this.debugName, "Removed listener:", listenerId);
    }

    return before !== filtered.length;
  }

  emit(eventKey: EventKey<K>, index: number, content: R): void {
    const key = this.makeKey(eventKey, index);

    if (this.lastValue.has(key)) {
      const oldValue = this.lastValue.get(key);

      if (oldValue === content) {
        return;
      }
    }

    this.lastValue.set(key, content);

    this.listeners.get(key)?.forEach((item) => item.callback(content));

    if (this.debug) {
      console.log(this.debugName, "Emit event:", key);
    }
  }

  clearLastValue(eventKey: EventKey<K>, index: number) {
    const key = this.makeKey(eventKey, index);
    this.lastValue.delete(key);
  }
}
