import { AudioMeter } from "@/features/engine/lib/gain";
import { SynthNode } from "../node";
import { EventManager } from "../events";
import { EventKey, TEventType } from "../types/node.type";
import {
  IControllerChange,
  IProgramChange,
} from "@/features/engine/types/synth.type";
import {
  MAIN_VOLUME,
  PAN,
  REVERB,
  CHORUSDEPTH,
} from "@/features/engine/types/node.type";
import { SynthNodeState } from "../state";

export class SynthChannel {
  // Index
  public channel: number | undefined;

  // Value
  public volume: SynthNode | undefined = undefined;

  // Effect
  public chorus: SynthNode<number> | undefined = undefined;
  public reverb: SynthNode<number> | undefined = undefined;
  public transpose: SynthNode<number> | undefined = undefined;
  public pan: SynthNode<number> | undefined = undefined;

  // State
  public velocity: SynthNodeState<number> | undefined = undefined;
  public expression: SynthNodeState<number> | undefined = undefined;
  public program: SynthNodeState<number> | undefined = undefined;
  public isDrum: SynthNodeState<boolean> | undefined = undefined;
  public isActive: SynthNodeState<boolean> | undefined = undefined;

  // Render
  public analyserNode?: AnalyserNode | undefined = undefined;
  public gain: AudioMeter | undefined = undefined;

  // Event
  public nodeEvent = new EventManager<TEventType<any>>();
  public stateEvent = new EventManager<TEventType<any>>();

  constructor(channel: number) {
    this.channel = channel;
    this.volume = new SynthNode(this.nodeEvent, "VOLUME", channel, 100);
    this.chorus = new SynthNode(this.nodeEvent, "CHORUS", channel, 100);
    this.reverb = new SynthNode(this.nodeEvent, "REVERB", channel, 100);
    this.pan = new SynthNode(this.nodeEvent, "PAN", channel, 100);

    this.program = new SynthNodeState(this.stateEvent, "PROGARM", channel);
    this.velocity = new SynthNodeState(this.stateEvent, "VELOCITY", channel);
    this.expression = new SynthNodeState(
      this.stateEvent,
      "EXPRESSION",
      channel
    );
  }

  public setAnalyser(analyserNode: AnalyserNode) {
    this.analyserNode = analyserNode;
  }

  public getGain() {
    if (!this.analyserNode) {
      return 0;
    }
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode?.getByteFrequencyData(dataArray);
    const value = Math.round(
      dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length
    );
    return value;
  }

  public handleControllerChange<T>(
    event: IControllerChange<T>,
    action: (control: any, value: T) => void
  ) {
    switch (event.controllerNumber) {
      case MAIN_VOLUME:
        this.volume && action(this.volume, event.controllerValue);
        break;
      case PAN:
        this.pan && action(this.pan, event.controllerValue);
        break;
      case REVERB:
        this.reverb && action(this.reverb, event.controllerValue);
        break;
      case CHORUSDEPTH:
        this.chorus && action(this.chorus, event.controllerValue);
        break;
      default:
        break;
    }
  }
  public programChange(event: IProgramChange) {
    this.program?.setValue(event.program);
  }

  public controllerChange(event: IControllerChange<any>) {
    this.handleControllerChange(event, (control, value) => {
      control.setValue(value);
    });
  }

  public lockChange(event: IControllerChange<boolean>) {
    this.handleControllerChange(event, (control, value) => {
      control.setLock(value);
    });
  }

  public muteChange(event: IControllerChange<boolean>) {
    this.handleControllerChange(event, (control, value) => {
      control.setMute(value);
    });
  }

  setCallBack<T = any>(
    eventType: EventKey,
    channel: number,
    callback: (event: TEventType<T>) => void
  ): void {
    this.nodeEvent.add(eventType, channel, callback);
  }

  setCallBackState<T = any>(
    eventType: EventKey,
    channel: number,
    callback: (event: TEventType<T>) => void
  ): void {
    this.stateEvent.add(eventType, channel, callback);
  }

  removeCallback(
    eventType: EventKey,
    channel: number,
    callback: (event: TEventType<any>) => void
  ): boolean {
    return this.nodeEvent.remove(eventType, channel, callback);
  }
}
