import { MAIN_VOLUME } from "@/features/engine/types/node.type";
import { EventManager } from "../events";
import { INodeKey, SynthNodeProps, TEventType } from "../types/node.type";

export class SynthNode<T = any> implements SynthNodeProps<T> {
  public value: T | undefined = undefined;
  public isMute: boolean = false;
  public isLocked: boolean = false;
  public type: INodeKey = "VOLUME";
  public channel: number = 0;
  public event: EventManager<TEventType<any>> | undefined = undefined;

  constructor(
    event?: EventManager<TEventType<any>>,
    type?: INodeKey,
    channel?: number,
    value?: T,
    isMute?: boolean,
    isLock?: boolean
  ) {
    if (value) this.value = value;
    if (isMute) this.isMute = isMute;
    if (isLock) this.isLocked = isLock;
    if (event) this.event = event;
    if (type) this.type = type;
    if (channel) this.channel = channel;
  }

  public setLock(isLock: boolean) {
    this.isLocked = isLock;

    if (!this.type) return;
    this.event?.trigger([this.type, "LOCK"], this.channel, {
      channel: this.channel,
      eventType: this.type,
      value: isLock,
    });
  }

  public setMute(mute: boolean) {
    this.isMute = mute;

    if (!this.type) return;
    this.event?.trigger([this.type, "MUTE"], this.channel, {
      channel: this.channel,
      eventType: this.type,
      value: mute,
    });
  }

  public setValue(value: T) {
    this.value = value;

    if (!this.type) return;
    this.event?.trigger([this.type, "CHANGE"], this.channel, {
      channel: this.channel,
      eventType: this.type,
      value: value,
    });
  }
}
