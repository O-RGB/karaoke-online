import { SynthNode } from "../node";
import { EventManager } from "../events";
import {
  EventKey,
  INodeKey,
  INodeState,
  INoteState,
  TEventType,
} from "../types/node.type";
import {
  IControllerChange,
  INoteChange,
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
import { KeyboardNode } from "../keyboard-node";
import { KeyModifierManager } from "spessasynth_lib/@types/synthetizer/key_modifier_manager";
import { DRUM_CHANNEL } from "@/config/value";

export class SynthChannel {
  // Index
  public channel: number | undefined;

  // Note
  public note: KeyboardNode | undefined = undefined;

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

  // Event
  public nodeEvent = new EventManager<INodeKey, TEventType<number>>();
  public stateEvent = new EventManager<INodeState, TEventType<any>>();
  public noteEvent: EventManager<INoteState, TEventType<boolean>>[] = [];

  // Group
  public instrumental: InstrumentalNode | undefined = undefined;

  constructor(
    channel: number,
    instrumental: InstrumentalNode,
    analyserNode: AnalyserNode,
    keyModifierManager: KeyModifierManager | undefined
  ) {
    this.channel = channel;
    if (channel === DRUM_CHANNEL) {
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
    if (keyModifierManager) {
      this.note = new KeyboardNode(channel, keyModifierManager);
    }
  }

  public getGain(getDrum: boolean = false) {
    if (this.isDrum?.value === true && getDrum === false) {
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

  public getAnalyser() {
    return this.analyserNode;
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

  public noteOnChange(event: INoteChange) {
    if (!this.note) return;
    this.note?.setOn(event);
  }

  public noteOffChange(event: INoteChange) {
    if (!this.note) return;
    this.note?.setOff(event);
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

  setCallBackNote(
    eventType: EventKey<INoteState>,
    index: number,
    keyNote: number,
    callback: (event: TEventType<any>) => void,
    componentId: string
  ): void {
    this.noteEvent[keyNote].add(eventType, index, callback, componentId);
  }

  removeCallNote(
    eventType: EventKey<INoteState>,
    index: number,
    keyNote: number,
    componentId: string
  ): boolean {
    return this.noteEvent[keyNote].remove(eventType, index, componentId);
  }

  reset() {
    this.isDrum?.reset();
    this.volume?.reset();
    this.maxVolume?.reset();
    this.chorus?.reset();
    this.reverb?.reset();
    this.pan?.reset();
    this.program?.reset();
    this.velocity?.reset();
    this.expression?.reset();
    this.expression?.reset();
  }
}
