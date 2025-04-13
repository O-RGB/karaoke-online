import { EventManager } from "../events";
import { SynthNodeProps, TEventType } from "../types/node.type";

export class SynthNode<K = any, R = any> implements SynthNodeProps<K, R> {
  public value: R | undefined = undefined;
  public isMute: boolean = false;
  public isLocked: boolean = false;
  public type: K | undefined;
  public channel: number = 0;
  public event: EventManager<K, TEventType<R>> | undefined = undefined;
  public backupValue: R | undefined = undefined;

  constructor(
    event?: EventManager<K, TEventType<R>>,
    type?: K,
    channel?: number,
    value?: R,
    isMute?: boolean,
    isLock?: boolean
  ) {
    if (value !== undefined) {
      this.value = value;
      this.backupValue = value;
    }
    if (isMute !== undefined) this.isMute = isMute;
    if (isLock !== undefined) this.isLocked = isLock;
    if (event !== undefined) this.event = event;
    if (type !== undefined) this.type = type;
    if (channel !== undefined) this.channel = channel;
  }

  public setLock(isLock: boolean) {
    this.isLocked = isLock;

    if (!this.type) return;
    this.event?.trigger([this.type, "LOCK"], this.channel, {
      value: isLock,
    });
  }

  public setMute(mute: boolean) {
    this.isMute = mute;

    if (!this.type) return;
    this.event?.trigger([this.type, "MUTE"], this.channel, {
      value: mute,
    });
  }

  public setValue(value: R) {
    this.value = value;

    if (!this.type) return;
    this.event?.trigger([this.type, "CHANGE"], this.channel, {
      value: value,
    });
  }

  public reset() {
    if (this.backupValue !== undefined) {
      console.log("reset value", this.backupValue);
      this.setValue(this.backupValue);
    }
  }
}
