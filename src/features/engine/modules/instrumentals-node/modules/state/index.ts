import { EventManager } from "../events";
import { SynthNode } from "../node";
import { INodeKey, INodeState, TEventType } from "../types/node.type";

export class SynthNodeState<T = any> extends SynthNode<T> {
  constructor(
    event: EventManager<TEventType<any>>,
    type?: INodeState,
    channel?: number
  ) {
    super(event, type as INodeKey, channel);
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
