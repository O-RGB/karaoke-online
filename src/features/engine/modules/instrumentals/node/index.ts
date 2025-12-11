import { EventEmitter } from "../events";
import { EventKey, SynthControlProps, TEventType } from "../types/node.type";

export class SynthControl<K = any, R = any> implements SynthControlProps<K, R> {
  public value?: R;
  public backupValue?: R;

  public isMute = false;
  public isLocked = false;

  public type?: K;
  public channel: number = 0;
  public events?: EventEmitter<K, TEventType<R>>;

  constructor(
    events?: EventEmitter<K, TEventType<R>>,
    type?: K,
    channel?: number,
    value?: R,
    isMute?: boolean,
    isLock?: boolean
  ) {
    this.value = value;
    this.backupValue = value;

    if (isMute !== undefined) this.isMute = isMute;
    if (isLock !== undefined) this.isLocked = isLock;

    this.type = type;
    this.channel = channel ?? 0;
    this.events = events ?? new EventEmitter<K, TEventType<R>>();
  }

  public setLock(val: boolean) {
    this.isLocked = val;
    if (!this.type) return;

    this.events?.emit([this.type, "LOCK"], this.channel, { value: val });
  }

  public setMute(val: boolean) {
    this.isMute = val;
    if (!this.type) return;

    this.events?.emit([this.type, "MUTE"], this.channel, { value: val });
  }

  public setValue(val: R) {
    this.value = val;
    if (!this.type) return;

    this.events?.emit([this.type, "CHANGE"], this.channel, { value: val });
  }

  public reset() {
    if (this.backupValue !== undefined) {
      this.setValue(this.backupValue);
    }
  }

  public on(
    eventKey: EventKey<K>,
    callback: (event: TEventType<R>) => void,
    listenerId: string
  ) {
    if (!this.type || !this.events) return;

    this.events.on(eventKey, this.channel, callback, listenerId);

    const lastValue =
      eventKey[1] === "CHANGE"
        ? this.value
        : eventKey[1] === "MUTE"
        ? this.isMute
        : this.isLocked;

    callback({ value: lastValue as any });
  }

  public off(eventKey: EventKey<K>, listenerId: string) {
    if (!this.type || !this.events) return;

    this.events.off(eventKey, this.channel, listenerId);
  }
}
