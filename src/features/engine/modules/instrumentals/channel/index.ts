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
import { ChannelEqualizer } from "../../equalizer/channel-equalizer";
import { ConfigSystem } from "@/features/config/types/config.type";

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
  public transpose: SynthNode<null, number> | undefined = undefined;
  public pan: SynthNode<INodeKey, number> | undefined = undefined;

  // State
  public velocity: SynthNode<INodeState, number> | undefined = undefined;
  public expression: SynthNode<INodeState, number> | undefined = undefined;
  public program: SynthNode<INodeState, number> | undefined = undefined;
  public isDrum: SynthNode<INodeState, boolean> | undefined = undefined;
  public isActive: SynthNode<INodeState, boolean> | undefined = undefined;

  // Render
  public analyserNode?: AnalyserNode | undefined = undefined;
  public velocityMode?: boolean = false;
  private simulatedVelocityGain: number = 0;

  // Event
  public globalNoteOnEvent = new EventManager<INoteState, INoteChange>();

  // Group
  public instrumental: InstrumentalNode | undefined = undefined;

  public equalizer: ChannelEqualizer | undefined = undefined;
  public audioContext: AudioContext | undefined = undefined;
  public systemConfig?: Partial<ConfigSystem>;

  constructor(
    channel: number,
    instrumental: InstrumentalNode,
    audioContext: AudioContext,
    keyModifierManager: KeyModifierManager | undefined,
    systemConfig?: Partial<ConfigSystem>
  ) {
    if (!audioContext) {
      console.warn("No audioContext!");
      return;
    }

    this.channel = channel;
    if (channel === DRUM_CHANNEL) {
      this.isDrum = new SynthNode(undefined, "DRUM", channel, true);
    }
    this.instrumental = instrumental;
    this.audioContext = audioContext;
    this.volume = new SynthNode(undefined, "VOLUME", channel, 100);
    this.maxVolume = new SynthNode(undefined, "MAX_VOLUME", channel, 10);
    this.chorus = new SynthNode(undefined, "CHORUS", channel, 100);
    this.reverb = new SynthNode(undefined, "REVERB", channel, 100);
    this.pan = new SynthNode(undefined, "PAN", channel, 100);
    this.program = new SynthNode(undefined, "PROGARM", channel);
    this.velocity = new SynthNode(undefined, "VELOCITY", channel);
    this.expression = new SynthNode(undefined, "EXPRESSION", channel);
    this.transpose = new SynthNode(undefined, null, channel, 0);
    this.expression.setLock(true);

    if (keyModifierManager) {
      this.note = new KeyboardNode(channel, keyModifierManager);
    }

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    if (systemConfig?.sound?.equalizer) {
      this.equalizer = new ChannelEqualizer(audioContext);
      analyser.connect(this.equalizer.input);
      this.equalizer.output.connect(audioContext.destination);
    }

    this.analyserNode = analyser;
    // console.log("Audio routing complete for channel", channel);
  }

  public setVelocityRender(bool: boolean) {
    this.velocityMode = bool;
  }

  public getGain(getDrum: boolean = false) {
    if (this.velocityMode) {
      return this.simulatedVelocityGain;
    }

    if (this.isDrum?.value === true && getDrum === false) {
      return 0;
    }

    if (this.systemConfig?.sound?.equalizer) {
      if (!this.equalizer) {
        console.error("equalizer is not initialized");
        return 0;
      }
      if (
        this.equalizer &&
        (this.equalizer.isEQEnabled() || this.equalizer.getBoostLevel() > 0)
      ) {
        return this.equalizer.getVolumeLevel();
      }
    } else {
      if (this.analyserNode) {
        const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
        this.analyserNode.getByteFrequencyData(dataArray);
        const value = Math.round(
          dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length
        );
        return value;
      }
    }

    return 0;
  }

  public getAnalyser() {
    return this.analyserNode;
  }

  public handleControllerChange<T>(
    event: IControllerChange<T>,
    action: (control: any, value: T) => void
  ) {
    console.log("on main value updated", event);
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
    this.program?.setValue(event.program);
    this.instrumental?.update(event, oldIndex, this);
  }

  public noteOnChange(event: INoteChange) {
    // this.note?.setOn(event);
    this.globalNoteOnEvent.trigger(["NOTE_ON", "CHANGE"], 0, event);
    if (this.velocityMode) {
      this.simulatedVelocityGain = event.velocity;
    }
  }

  public noteOffChange(event: INoteChange) {
    // this.note?.setOff(event);
    this.globalNoteOnEvent.trigger(["NOTE_OFF", "CHANGE"], 0, event);
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
}
