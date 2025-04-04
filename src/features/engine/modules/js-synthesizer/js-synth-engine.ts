import { CHANNEL_DEFAULT, DEFAULT_SOUND_FONT } from "@/config/value";
import { JsSynthPlayerEngine } from "./player/js-synth-player";

import {
  BaseSynthEngine,
  BaseSynthPlayerEngine,
  IControllerChange,
  IProgramChange,
  IVelocityChange,
  TimingModeType,
} from "../../types/synth.type";
import { Synthesizer as JsSynthesizer } from "js-synthesizer";
import { AudioMeter } from "../../lib/gain";
import { ChannelGainMonitor } from "./lib/channel-gain-monitor";
import { InstrumentalNode } from "../instrumentals/instrumental";
import { SynthChannel } from "../instrumentals/channel";
import { BassConfig } from "../instrumentals/config";
import { SoundSetting } from "@/features/config/types/config.type";
import {
  CHORUSDEPTH,
  EXPRESSION,
  MAIN_VOLUME,
  PAN,
  REVERB,
} from "../../types/node.type";

export class JsSynthEngine implements BaseSynthEngine {
  public time: TimingModeType = "Tick";
  public synth: JsSynthesizer | undefined;
  public audio: AudioContext | undefined;
  public player: BaseSynthPlayerEngine | undefined;
  public preset: number[] = [];
  public analysers: AnalyserNode[] = [];
  public soundfontName: string | undefined;
  public soundfontFile: File | undefined;

  public nodes: SynthChannel[] = [];
  public instrumental = new InstrumentalNode();

  public gainNode: AudioMeter | undefined = undefined;
  public bassConfig: BassConfig | undefined = undefined;

  private setInstrument: ((instrument: IPersetSoundfont[]) => void) | undefined;
  constructor(
    setInstrument?: (instrument: IPersetSoundfont[]) => void,
    config?: Partial<SoundSetting>
  ) {
    this.bassConfig = config ? new BassConfig(config) : undefined;
    this.setInstrument = setInstrument;
    this.startup();
  }

  async startup() {
    const audioContext = new AudioContext();

    const { Synthesizer } = await import("js-synthesizer");
    const synth = new Synthesizer();

    synth.init(audioContext.sampleRate);

    const node = synth.createAudioNode(audioContext, 8192);

    synth.setGain(0.3);

    this.loadDefaultSoundFont();

    this.synth = synth;
    this.audio = audioContext;

    const gainMonitor = new ChannelGainMonitor(audioContext);
    gainMonitor.connectToSynth(node);

    // รับค่า analysers
    this.analysers = gainMonitor.analyserNodes;
    this.gainNode = new AudioMeter(gainMonitor.analyserNodes);
    this.analysers = gainMonitor.analyserNodes;

    node.connect(audioContext.destination);

    this.player = new JsSynthPlayerEngine(synth);

    this.instrumental.setEngine(this);
    // this.nodes = CHANNEL_DEFAULT.map(
    //   (v, i) => new SynthChannel(i, this.instrumental)
    // );

    this.controllerChange();
    this.programChange();

    return { synth: synth, audio: this.audio };
  }

  async loadPresetSoundFont(sfId?: number) {
    if (!sfId) {
      return [];
    }

    const preset = this.synth?.getSFontObject(sfId)?.getPresetIterable();
    if (preset) {
      const presetList = Array.from(preset);

      const instrument: IPersetSoundfont[] = presetList.map((data) => ({
        bank: data.bankNum,
        presetName: data.name,
        program: data.num,
      }));
      this.setInstrument?.(instrument);
    }
  }

  async loadDefaultSoundFont() {
    let arraybuffer: ArrayBuffer | undefined = undefined;
    if (this.soundfontFile) {
      arraybuffer = await this.soundfontFile.arrayBuffer();
    } else {
      const res = await fetch(DEFAULT_SOUND_FONT);
      arraybuffer = await res.arrayBuffer();

      const blob = new Blob([arraybuffer], {
        type: "application/octet-stream",
      });
      const fileBlob = new File([blob], "soundfont.sf2", {
        type: "application/octet-stream",
      });
      this.soundfontFile = fileBlob;
    }

    const sfId = await this.synth?.loadSFont(arraybuffer);
    this.soundfontName = "Default Soundfont sf2";

    this.loadPresetSoundFont(sfId);
  }

  async setSoundFont(file: File) {
    const bf = await file.arrayBuffer();
    try {
      const sfId = await this.synth?.loadSFont(bf);
      this.soundfontName = file.name;
      this.loadPresetSoundFont(sfId);
      return true;
    } catch (error) {
      return false;
    }
  }

  controllerChange(callback?: (event: IControllerChange) => void): void {
    if (this.player?.addEvent) {
      this.player.addEvent({
        controllerChangeCallback: (e) => {
          callback?.(e);
          console.log("controller change, e", e);
          this.nodes[e.channel].controllerChange(e);
        },
      });
    }
  }
  persetChange(): void {}
  programChange(callback?: (event: IProgramChange) => void): void {
    if (this.player?.addEvent) {
      this.player.addEvent({
        programChangeCallback: (e) => {
          callback?.(e);
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
        },
      });
    }
  }
  setProgram(event: IProgramChange): void {
    this.synth?.midiProgramChange(event.channel, event.program);
    this.nodes[event.channel].programChange(event);
  }

  setMute(event: IControllerChange<boolean>): void {
    this.nodes[event.channel].muteChange({
      channel: event.channel,
      controllerNumber: event.controllerNumber,
      controllerValue: event.controllerValue,
    });
  }
  setVelocity(event: IVelocityChange): void {}

  setMidiOutput(): void {}

  setController(event: IControllerChange): void {
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
    this.synth?.midiControl(
      event.channel,
      event.controllerNumber,
      event.controllerValue
    );
    if (isLocked === true || event.force) {
      this.lockController({ ...event, controllerValue: true });
    }
  }

  lockController(event: IControllerChange<boolean>): void {
    // this.synth?.lockController(
    //   event.channel,
    //   event.controllerNumber,
    //   event.controllerValue
    // );

    this.nodes[event.channel].lockChange({
      channel: event.channel,
      controllerNumber: event.controllerNumber,
      controllerValue: event.controllerValue,
    });
  }
  updatePitch(channel: number, semitones?: number): void {}
  updatePreset(channel: number, value: number): void {}

  setBassLock(program: number): void {
    this.bassConfig?.setLockBass(program);
    const bass = this.instrumental.group.get("bass");
    bass?.forEach((node) => {
      if (node.channel !== undefined) {
        this.setProgram({ channel: node.channel, program });
      }
    });
  }
}
