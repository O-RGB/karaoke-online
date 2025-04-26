import { EventKey } from "../types/node.type";

export class EventManager<K = any, R = any> {
  public callbacks: Map<
    string,
    { componentId: string; callback: (event: R) => void }[]
  > = new Map();
  public debug: boolean = false;
  public debugName: string | undefined = undefined;

  private generateKey(eventKey: EventKey<K>, index: number): string {
    return `${eventKey.join("-")}-${index}`;
  }

  openDebug(bool: boolean, debugName?: string) {
    this.debug = bool;
    this.debugName = debugName;
  }

  add(
    eventKey: EventKey<K>,
    index: number,
    callback: (event: R) => void,
    componentId: string
  ): void {
    const key = this.generateKey(eventKey, index);

    if (!this.callbacks.has(key)) {
      this.callbacks.set(key, []);
    }

    // Check if this component has already registered a callback for this event
    const existingCallbackIndex = this.callbacks
      .get(key)
      ?.findIndex((item) => item.componentId === componentId);

    if (existingCallbackIndex === undefined || existingCallbackIndex === -1) {
      // Only add if no callback from this component exists
      this.callbacks.get(key)?.push({ componentId, callback });

      if (this.debug) {
        console.log(
          this.debugName,
          "Added new callback for component:",
          componentId
        );
        console.log(this.debugName, this.callbacks);
      }
    } else if (this.debug) {
      console.log(
        this.debugName,
        "Callback for component already exists:",
        componentId
      );
    }
  }

  remove(eventKey: EventKey<K>, index: number, componentId: string): boolean {
    const key = this.generateKey(eventKey, index);

    if (this.callbacks.has(key)) {
      const list = this.callbacks.get(key);
      if (list) {
        const initialLength = list.length;
        const filteredList = list.filter(
          (item) => item.componentId !== componentId
        );
        this.callbacks.set(key, filteredList);

        if (this.debug && initialLength !== filteredList.length) {
          console.log(
            this.debugName,
            "Removed callbacks for component:",
            componentId
          );
        }

        return initialLength !== filteredList.length;
      }
    }
    return false;
  }

  trigger(eventKey: EventKey<K>, index: number, eventContent: R): void {
    const key = this.generateKey(eventKey, index);
    this.callbacks.get(key)?.forEach((item) => item.callback(eventContent));

    if (this.debug) {
      console.log(this.debugName, "Triggered event:", key);
    }
  }
}

export class SingleCallbackEventManager<K = any, R = any> {
  private callbacks: Map<string, (event: R) => any> = new Map();
  public debug: boolean = false;
  public debugName?: string;

  openDebug(bool: boolean, debugName?: string) {
    this.debug = bool;
    this.debugName = debugName;
  }

  private generateKey(eventKey: EventKey<K>): string {
    return eventKey.join("-");
  }

  setCallback(eventKey: EventKey<K>, callback: (event: R) => any): void {
    const key = this.generateKey(eventKey);
    this.callbacks.set(key, callback);

    if (this.debug) {
      console.log(this.debugName, `Callback set for key:`, key);
    }
  }

  clearCallback(eventKey: EventKey<K>): void {
    const key = this.generateKey(eventKey);
    this.callbacks.delete(key);

    if (this.debug) {
      console.log(this.debugName, `Callback cleared for key:`, key);
    }
  }

  trigger(eventKey: EventKey<K>, event: R): any {
    const key = this.generateKey(eventKey);
    const callback = this.callbacks.get(key);

    if (callback) {
      if (this.debug) {
        console.log(this.debugName, `Triggering callback for key:`, key, "with", event);
      }
      return callback(event);
    }

    if (this.debug) {
      console.warn(this.debugName, `No callback set for key:`, key);
    }
  }
}
