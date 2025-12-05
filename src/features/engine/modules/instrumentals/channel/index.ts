import { SynthNode } from "../node";
import { EventManager } from "../events";
import { INodeKey, INodeState, INoteState } from "../types/node.type";
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
  public channel: number | undefined;

  public note: KeyboardNode | undefined = undefined;

  public volume: SynthNode<INodeKey, number> | undefined = undefined;
  public maxVolume: SynthNode<INodeKey, number> | undefined = undefined;

  public chorus: SynthNode<INodeKey, number> | undefined = undefined;
  public reverb: SynthNode<INodeKey, number> | undefined = undefined;
  public transpose: SynthNode<null, number> | undefined = undefined;
  public pan: SynthNode<INodeKey, number> | undefined = undefined;

  public velocity: SynthNode<INodeState, number> | undefined = undefined;
  public expression: SynthNode<INodeState, number> | undefined = undefined;
  public program: SynthNode<INodeState, number> | undefined = undefined;
  public isDrum: SynthNode<INodeState, boolean> | undefined = undefined;
  public isActive: SynthNode<INodeState, boolean> | undefined = undefined;

  public analyserNode?: AnalyserNode | undefined = undefined;
  public velocityMode?: boolean = false;

  private simulatedVelocityGain: number = 0;
  private smoothedGain: number = 0;
  private smoothingSpeedUp = 0.2;
  private smoothingSpeedDown = 0.05;
  private animationId?: number;

  private activeNotes = new Map<number, number>();

  public globalNoteOnEvent = new EventManager<INoteState, INoteChange>();

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
    this.systemConfig = systemConfig;
  }

  public setTranspose(
    newTranspose: number,
    stopActiveNotes: boolean = true
  ): void {
    const oldTranspose = this.transpose?.value ?? 0;

    if (oldTranspose === newTranspose) return;

    if (stopActiveNotes && this.channel !== DRUM_CHANNEL) {
      this.stopAllActiveNotes();
    }

    this.transpose?.setValue(newTranspose);
  }

  public stopAllActiveNotes(): void {
    this.activeNotes.clear();
  }

  public noteOnChange(event: INoteChange) {
    this.globalNoteOnEvent.trigger(["NOTE_ON", "CHANGE"], 0, event);

    if (this.channel !== DRUM_CHANNEL) {
      const currentTranspose = this.transpose?.value ?? 0;
      this.activeNotes.set(event.midiNote, currentTranspose);
    }

    if (this.velocityMode) {
      this.simulatedVelocityGain = event.velocity;
    }
  }

  public noteOffChange(event: INoteChange) {
    this.globalNoteOnEvent.trigger(["NOTE_OFF", "CHANGE"], 0, event);

    if (this.channel !== DRUM_CHANNEL) {
      this.activeNotes.delete(event.midiNote);
    }
  }

  public getNoteTranspose(midiNote: number): number {
    return this.activeNotes.get(midiNote) ?? this.transpose?.value ?? 0;
  }

  public hasActiveNotes(): boolean {
    return this.activeNotes.size > 0;
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

  public transposeChange(newTranspose: number): void {
    this.setTranspose(newTranspose, true);
  }

  private startSmoothing() {
    if (this.animationId) return;
    const animate = () => {
      const target = this.simulatedVelocityGain;
      const diff = target - this.smoothedGain;
      const speed = diff > 0 ? this.smoothingSpeedUp : this.smoothingSpeedDown;
      this.smoothedGain += diff * speed;

      this.animationId = requestAnimationFrame(animate);
    };
    this.animationId = requestAnimationFrame(animate);
  }

  private stopSmoothing() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
    }
  }

  public setVelocityRender(bool: boolean) {
    this.velocityMode = bool;
    if (bool) {
      this.startSmoothing();
    } else {
      this.stopSmoothing();
    }
  }

  public getGain(getDrum: boolean = false) {
    if (this.velocityMode) {
      return this.smoothedGain;
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
        const dataArray = new Uint8Array(this.analyserNode.fftSize);
        this.analyserNode.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const amplitude = dataArray[i] - 128;
          sum += amplitude * amplitude;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        const value = Math.round(rms * 2);
        return value;
      }
    }

    return 0;
  }

  public getAnalyser() {
    return this.analyserNode;
  }

  public programChange(event: IProgramChange) {
    const oldIndex: number = this.program?.value ?? 0;
    this.program?.setValue(event.program);
    this.instrumental?.update(event, oldIndex, this);
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
