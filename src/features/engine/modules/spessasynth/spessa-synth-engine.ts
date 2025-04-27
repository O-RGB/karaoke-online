import { Synthetizer as Spessasynth } from "spessasynth_lib";
import { loadAudioContext, loadPlayer } from "./lib/spessasynth";
import { CHANNEL_DEFAULT, DEFAULT_SOUND_FONT } from "@/config/value";
import { SpessaPlayerEngine } from "./player/spessa-synth-player";
import { RemoteSendMessage } from "@/features/remote/types/remote.type";
import { ConfigSystem, SoundSetting } from "@/features/config/types/config.type";
import { SynthChannel } from "../instrumentals/channel";
import { InstrumentalNode } from "../instrumentals/instrumental";
import { BassConfig } from "../instrumentals/config";
import {
  CHORUSDEPTH,
  EXPRESSION,
  MAIN_VOLUME,
  PAN,
  REVERB,
} from "../../types/node.type";
import {
  BaseSynthEngine,
  BaseSynthPlayerEngine,
  IControllerChange,
  INoteChange,
  IProgramChange,
  IVelocityChange,
  TimingModeType,
} from "../../types/synth.type";
import { GlobalEqualizer } from "../equalizer/global-equalizer";
export class SpessaSynthEngine implements BaseSynthEngine {
  public time: TimingModeType = "Time";
  public synth: Spessasynth | undefined;
  public audio: AudioContext | undefined;
  public player: BaseSynthPlayerEngine | undefined;
  public preset: number[] = [];
  public analysers: AnalyserNode[] = [];
  public soundfontName: string = "Default Soundfont sf2";
  public soundfontFile: File | undefined;

  public nodes: SynthChannel[] = [];
  public instrumental = new InstrumentalNode();

  public bassConfig: BassConfig | undefined = undefined;
  public globalEqualizer: GlobalEqualizer | undefined = undefined;

  public systemConfig?: Partial<ConfigSystem> = undefined

  private sendMessage?: (info: RemoteSendMessage) => void;

  constructor(
    setInstrument?: (instrument: IPersetSoundfont[]) => void,
    sendMessage?: (info: RemoteSendMessage) => void,
    config?: Partial<SoundSetting>,
    systemConfig?: Partial<ConfigSystem>
  ) {
    this.startup(setInstrument, systemConfig);
    this.bassConfig = config ? new BassConfig(config) : undefined;
    this.sendMessage = sendMessage;
    this.systemConfig = systemConfig
  }

  async startup(setInstrument?: (instrument: IPersetSoundfont[]) => void, systemConfig?: Partial<ConfigSystem>) {
    const { audioContext, channels } = await loadAudioContext();
    if (!audioContext)
      return { audio: undefined, synth: undefined, player: undefined };

    const synth = await this.loadDefaultSoundFont(audioContext);
    if (!synth)
      return { audio: undefined, synth: undefined, player: undefined };

    const player = await loadPlayer(synth);
    synth.setMainVolume(1);

    this.synth = synth;
    this.audio = audioContext;

    this.persetChange((e) => setInstrument?.(e));
    this.synth?.setDrums(9, true);
    this.player = new SpessaPlayerEngine(player);
    this.instrumental.setEngine(this);

    const analysers: AnalyserNode[] = [];

    for (let ch = 0; ch < CHANNEL_DEFAULT.length; ch++) {
      const synthChannel = new SynthChannel(
        ch,
        this.instrumental,
        audioContext,
        synth.keyModifierManager,
        systemConfig
      );

      this.nodes.push(synthChannel);
      const analyser = synthChannel.getAnalyser();
      if (analyser) {
        analysers.push(analyser);
      }
    }

    if (systemConfig?.sound?.equalizer) {
      this.globalEqualizer = new GlobalEqualizer(synth.context);
      synth.worklet.connect(this.globalEqualizer.input);
      this.globalEqualizer.output.connect(synth.context.destination);
    }

    synth?.connectIndividualOutputs(analysers);

    this.controllerChange();
    this.programChange();
    this.noteOnChange();
    this.noteOffChange();
    this.polyPressureChange();

    return { synth: synth, audio: this.audio };
  }
  async loadDefaultSoundFont(audio?: AudioContext): Promise<any> {
    let arraybuffer: ArrayBuffer | undefined = undefined;
    if (this.soundfontFile) {
      arraybuffer = await this.soundfontFile.arrayBuffer();
    } else {
      const res = await fetch(DEFAULT_SOUND_FONT);
      arraybuffer = await res.arrayBuffer();
      if (audio) {
        const synthInstance = new Spessasynth(audio.destination, arraybuffer);

        synthInstance.highPerformanceMode = false;

        const blob = new Blob([arraybuffer], {
          type: "application/octet-stream",
        });
        const fileBlob = new File([blob], "soundfont.sf2", {
          type: "application/octet-stream",
        });
        this.soundfontFile = fileBlob;

        await synthInstance.isReady;
        return synthInstance;
      }
    }

    await this.synth?.soundfontManager.reloadManager(arraybuffer);
    this.soundfontName = "Default Soundfont sf2";
  }

  getAnalyserNode(auto: AudioContext) {
    return Array.from({ length: 16 }, () => {
      const analyser = auto.createAnalyser();
      analyser.fftSize = 256;
      return analyser;
    });
  }

  private sendMessageData(value?: IControllerChange) {
    if (!this.sendMessage || !value) {
      return;
    }

    if (value)
      this.sendMessage({
        user: "SUPER",
        message: value,
        type: {
          event: "CHANGE",
          type: "CONTROLLER",
        },
      });
  }

  async setSoundFont(file: File) {
    const bf = await file.arrayBuffer();
    try {
      this.synth?.soundfontManager.reloadManager(bf);
      this.soundfontName = file.name;
      return true;
    } catch (error) {
      return false;
    }
  }


  polyPressureChange(event?: (event: INoteChange) => void): void {
    return this.synth?.eventHandler.addEvent(
      "polypressure",
      "poly-perssure-listener",
      (e: any) => {
        console.log(e);
      }
    );
  }
  noteOnChange(event?: (event: INoteChange) => void): void {
    return this.synth?.eventHandler.addEvent(
      "noteon",
      "note-on-listener",
      (e: INoteChange) => {
        this.nodes[e.channel].noteOnChange(e);
      }
    );
  }
  noteOffChange(event?: (event: INoteChange) => void): void {
    return this.synth?.eventHandler.addEvent(
      "noteoff",
      "note-off-listener",
      (e: INoteChange) => {
        this.nodes[e.channel].noteOffChange(e);
      }
    );
  }
  controllerChange(event?: (event: IControllerChange) => void): void {
    return this.synth?.eventHandler.addEvent(
      "controllerchange",
      "",
      (e: IControllerChange) => {
        this.nodes[e.channel].controllerChange(e);
        this.sendMessageData(e);
      }
    );
  }
  programChange(event?: (event: IProgramChange) => void): void {
    return this.synth?.eventHandler.addEvent(
      "programchange",
      "",
      (e: IProgramChange) => {
        const { channel, program } = e;
        const has = this.bassConfig?.onProgramChange(e);

        if (has?.isBass) {
          const nodeProgram = this.nodes[channel].program?.value;
          if (nodeProgram === program) return;

          this.setProgram(has.event);
          this.nodes[channel].programChange(has.event);
        } else {
          this.nodes[channel].programChange(e);
        }
      }
    );
  }

  persetChange(event: (event: IPersetSoundfont[]) => void): void {
    return this.synth?.eventHandler.addEvent(
      "presetlistchange",
      "",
      (perset: IPersetSoundfont[]) => {
        let sort = perset.sort((a, b) => a.program - b.program);
        let notFirst = sort.filter((x, i) => i !== 1);
        event(notFirst);
      }
    );
  }

  setProgram(event: IProgramChange) {
    this.synth?.programChange(event.channel, event.program, event.userChange);
    this.nodes[event.channel].programChange(event);
  }

  setVelocity(event: IVelocityChange): void {
    this.synth?.velocityOverride(event.channel, event.value);
  }

  setController(event: IControllerChange, form?: string): void {
    const node = this.nodes[event.channel];

    let isLocked = false;

    switch (event.controllerNumber) {
      case MAIN_VOLUME:
        isLocked = node.volume?.isLocked ?? false;
        break;
      case PAN:
        isLocked = node.pan?.isLocked ?? false;
        break;
      case REVERB:
        isLocked = node.reverb?.isLocked ?? false;
        break;
      case CHORUSDEPTH:
        isLocked = node.chorus?.isLocked ?? false;
        break;
      case EXPRESSION:
        isLocked = node.expression?.isLocked ?? false;
        break;

      default:
        break;
    }

    if (isLocked === true || event.force) {
      this.lockController({ ...event, controllerValue: false });
    }
    this.synth?.controllerChange(
      event.channel,
      event.controllerNumber,
      event.controllerValue,
      event.force
    );
    if (isLocked === true || event.force) {
      this.lockController({ ...event, controllerValue: true });
    }
  }

  lockController(event: IControllerChange<boolean>): void {
    this.synth?.lockController(
      event.channel,
      event.controllerNumber,
      event.controllerValue
    );

    this.nodes[event.channel].lockChange({
      channel: event.channel,
      controllerNumber: event.controllerNumber,
      controllerValue: event.controllerValue,
    });
  }

  updatePreset(channel: number, value: number): void {
    this.synth?.programChange(channel, value);
  }

  updatePitch(channel: number, semitones: number = 0): void {
    if (channel) {
      this.synth?.transposeChannel(channel, semitones);
    } else {
      this.synth?.transpose(semitones);
    }
  }

  setMute(event: IControllerChange<boolean>): void {
    this.synth?.muteChannel(event.channel, event.controllerValue);
    this.nodes[event.channel].muteChange({
      channel: event.channel,
      controllerNumber: event.controllerNumber,
      controllerValue: event.controllerValue,
    });
  }

  setBassLock(program: number) {
    this.bassConfig?.setLockBass(program);
    const bass = this.instrumental.group.get("bass");
    bass?.forEach((node) => {
      if (node.channel !== undefined) {
        this.setProgram({ channel: node.channel, program });
      }
    });
  }
}
