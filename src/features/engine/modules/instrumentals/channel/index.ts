import { AudioMeter } from "@/features/engine/lib/gain";
import { SynthNode } from "../node";
import { EventManager } from "../events";
import { EventKey, INodeKey, INodeState, TEventType } from "../types/node.type";
import {
  IControllerChange,
  IProgramChange,
} from "@/features/engine/types/synth.type";
import {
  MAIN_VOLUME,
  PAN,
  REVERB,
  CHORUSDEPTH,
  EXPRESSION,
} from "@/features/engine/types/node.type";
import { InstrumentalNode } from "../instrumental";

export class SynthChannel {
  // Index
  public channel: number | undefined;

  // Value
  public volume?: SynthNode<INodeKey, number> = undefined;

  // Effect
  public chorus: SynthNode<INodeKey, number> | undefined = undefined;
  public reverb: SynthNode<INodeKey, number> | undefined = undefined;
  public transpose: SynthNode<INodeKey, number> | undefined = undefined;
  public pan: SynthNode<INodeKey, number> | undefined = undefined;

  // State
  public velocity: SynthNode<INodeState, number> | undefined = undefined;
  public expression: SynthNode<INodeState, number> | undefined = undefined;
  public program: SynthNode<INodeState, number> | undefined = undefined;
  public isDrum: SynthNode<INodeState, boolean> | undefined = undefined;
  public isActive: SynthNode<INodeState, boolean> | undefined = undefined;

  // Render
  public analyserNode?: AnalyserNode | undefined = undefined;
  public gain: AudioMeter | undefined = undefined;

  // Event
  public nodeEvent = new EventManager<INodeKey, TEventType<number>>();
  public stateEvent = new EventManager<INodeState, TEventType<any>>();

  // Group
  public instrumental: InstrumentalNode | undefined = undefined;

  constructor(channel: number, instrumental: InstrumentalNode) {
    this.channel = channel;
    this.instrumental = instrumental;
    this.volume = new SynthNode(this.nodeEvent, "VOLUME", channel, 100);
    this.chorus = new SynthNode(this.nodeEvent, "CHORUS", channel, 100);
    this.reverb = new SynthNode(this.nodeEvent, "REVERB", channel, 100);
    this.pan = new SynthNode(this.nodeEvent, "PAN", channel, 100);

    this.program = new SynthNode(this.stateEvent, "PROGARM", channel);
    this.velocity = new SynthNode(this.stateEvent, "VELOCITY", channel);
    this.expression = new SynthNode(this.stateEvent, "EXPRESSION", channel);
    this.expression.setLock(true);
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
      case EXPRESSION:
        this.expression && action(this.expression, event.controllerValue);
        break;
      default:
        break;
    }
  }
  public programChange(event: IProgramChange, form: string) {
    const oldIndex: number = this.program?.value ?? 0;
    const oldChannel: number = this.channel ?? 0;
    this.program?.setValue(event.program);
    this.instrumental?.update(event, oldIndex, oldChannel, this);
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

  setCallBack(
    eventType: EventKey<INodeKey>,
    index: number,
    callback: (event: TEventType<number>) => void
  ): void {
    this.nodeEvent.add(eventType, index, callback);
  }

  setCallBackState(
    eventType: EventKey<INodeState>,
    index: number,
    callback: (event: TEventType<any>) => void
  ): void {
    this.stateEvent.add(eventType, index, callback);
  }

  removeCallback(
    eventType: EventKey<INodeKey>,
    index: number,
    callback: (event: TEventType<number>) => void
  ): boolean {
    return this.nodeEvent.remove(eventType, index, callback);
  }
}
