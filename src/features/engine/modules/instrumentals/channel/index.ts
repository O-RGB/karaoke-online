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
import { SynthControl } from "../node";
import { INodeKey, INodeState } from "../types/node.type";
import { DRUM_CHANNEL } from "@/config/value";
import { ChannelEqualizer } from "../../equalizer/channel-equalizer";
import { ConfigSystem } from "@/features/config/types/config.type";
import { NoteEventManager } from "../../notes-modifier-manager/note";

export class SynthChannel {
  public channel: number | undefined;
  public noteModifier: NoteEventManager[] = [];
  public volume: SynthControl<INodeKey, number> | undefined = undefined;

  public chorus: SynthControl<INodeKey, number> | undefined = undefined;
  public reverb: SynthControl<INodeKey, number> | undefined = undefined;
  public transpose: SynthControl<null, number> | undefined = undefined;
  public pan: SynthControl<INodeKey, number> | undefined = undefined;

  public program: SynthControl<INodeState, number> | undefined = undefined;
  public isDrum: SynthControl<INodeState, boolean> | undefined = undefined;
  public isActive: SynthControl<INodeState, boolean> | undefined = undefined;

  public analyserNode?: AnalyserNode | undefined = undefined;
  // public instrumental: InstrumentalNode | undefined = undefined;

  public equalizer: ChannelEqualizer | undefined = undefined;
  public audioContext: AudioContext | undefined = undefined;
  public systemConfig?: Partial<ConfigSystem>;

  constructor(
    channel: number,
    // instrumental: InstrumentalNode,
    audioContext: AudioContext,
    noteModifier: NoteEventManager[],
    systemConfig?: Partial<ConfigSystem>
  ) {
    if (!audioContext) {
      console.warn("No audioContext!");
      return;
    }

    this.channel = channel;
    if (channel === DRUM_CHANNEL) {
      this.isDrum = new SynthControl(undefined, "DRUM", channel, true);
    }
    // this.instrumental = instrumental;
    this.audioContext = audioContext;
    this.volume = new SynthControl(undefined, "VOLUME", channel, 100);
    this.chorus = new SynthControl(undefined, "CHORUS", channel, 100);
    this.reverb = new SynthControl(undefined, "REVERB", channel, 100);
    this.pan = new SynthControl(undefined, "PAN", channel, 100);
    this.program = new SynthControl(undefined, "PROGARM", channel);
    this.transpose = new SynthControl(undefined, null, channel, 0);
    this.noteModifier = noteModifier;

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

  public getAnalyser() {
    return this.analyserNode;
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
}
