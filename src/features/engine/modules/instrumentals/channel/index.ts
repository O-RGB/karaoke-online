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
  public volume: SynthNode<INodeKey, number> | undefined = undefined;
  public maxVolume: SynthNode<INodeKey, number> | undefined = undefined;

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
  // public gain: AudioMeter | undefined = undefined;

  // Event
  public nodeEvent = new EventManager<INodeKey, TEventType<number>>();
  public stateEvent = new EventManager<INodeState, TEventType<any>>();

  // Group
  public instrumental: InstrumentalNode | undefined = undefined;

  constructor(
    channel: number,
    instrumental: InstrumentalNode,
    analyserNode: AnalyserNode
  ) {
    this.channel = channel;
    if (channel === 9) {
      this.isDrum = new SynthNode(this.stateEvent, "DRUM", channel, true);
    }
    this.instrumental = instrumental;
    this.analyserNode = analyserNode;
    this.volume = new SynthNode(this.nodeEvent, "VOLUME", channel, 100);
    this.maxVolume = new SynthNode(this.nodeEvent, "MAX_VOLUME", channel, 10);
    this.chorus = new SynthNode(this.nodeEvent, "CHORUS", channel, 100);
    this.reverb = new SynthNode(this.nodeEvent, "REVERB", channel, 100);
    this.pan = new SynthNode(this.nodeEvent, "PAN", channel, 100);
    this.program = new SynthNode(this.stateEvent, "PROGARM", channel);
    this.velocity = new SynthNode(this.stateEvent, "VELOCITY", channel);
    this.expression = new SynthNode(this.stateEvent, "EXPRESSION", channel);
    this.expression.setLock(true);
  }

  public getGain() {
    if (this.isDrum?.value === true) {
      return 0;
    }
    if (!this.analyserNode) {
      console.error("AnalyserNode is not initialized");
      return 0;
    }
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(dataArray);
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
  public programChange(event: IProgramChange) {
    const oldIndex: number = this.program?.value ?? 0;
    const oldChannel: number = this.channel ?? 0;
    this.program?.setValue(event.program);
    this.instrumental?.update(event, oldIndex, oldChannel, this);
  }

  public controllerChange(event: IControllerChange<any>) {
    this.handleControllerChange(event, (control, value) => {
      // if (event.controllerNumber === MAIN_VOLUME && this.maxVolume) {
      //   const max = this.maxVolume.value;
      //   const controllerValue = event.controllerValue;
      //   const adjustedValue = (controllerValue / 127) * (max ?? 100);
      //   control.setValue(Math.ceil(adjustedValue));
      // } else {
      // }
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
    callback: (event: TEventType<number>) => void,
    componentId: string
  ): void {
    this.nodeEvent.add(eventType, index, callback, componentId);
  }

  removeCallback(
    eventType: EventKey<INodeKey>,
    index: number,
    componentId: string
  ): boolean {
    return this.nodeEvent.remove(eventType, index, componentId);
  }

  setCallBackState(
    eventType: EventKey<INodeState>,
    index: number,
    callback: (event: TEventType<any>) => void,
    componentId: string
  ): void {
    this.stateEvent.add(eventType, index, callback, componentId);
  }

  removeCallState(
    eventType: EventKey<INodeState>,
    index: number,
    componentId: string
  ): boolean {
    return this.stateEvent.remove(eventType, index, componentId);
  }
}
