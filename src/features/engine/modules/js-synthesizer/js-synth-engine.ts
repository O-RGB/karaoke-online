import { CHANNEL_DEFAULT, DEFAULT_SOUND_FONT } from "@/config/value";
import { JsSynthPlayerEngine } from "./player/js-synth-player";

import {
  BaseSynthEngine,
  BaseSynthPlayerEngine,
  IControllerChange,
  INoteChange,
  IProgramChange,
  IVelocityChange,
  TimingModeType,
} from "../../types/synth.type";
import {
  AudioWorkletNodeSynthesizer,
  Synthesizer as JsSynthesizer,
} from "js-synthesizer";
import { InstrumentalNode } from "../instrumentals/instrumental";
import { SynthChannel } from "../instrumentals/channel";
import { BassConfig } from "../instrumentals/config";
import {
  ConfigSystem,
  SoundSystemMode,
} from "@/features/config/types/config.type";
import {
  CHORUSDEPTH,
  EXPRESSION,
  MAIN_VOLUME,
  PAN,
  REVERB,
} from "../../types/node.type";
import { GlobalEqualizer } from "../equalizer/global-equalizer";

export class JsSynthEngine implements BaseSynthEngine {
  public time: TimingModeType = "Tick";
  public synth: JsSynthesizer | undefined;
  public audio: AudioContext | undefined;
  public player: BaseSynthPlayerEngine | undefined;
  public preset: number[] = [];
  public analysers: AnalyserNode[] = [];
  public soundfontName: string | undefined;
  public soundfontFile: File | undefined;
  public soundfontFrom: SoundSystemMode = "DATABASE_FILE_SYSTEM";
  public globalEqualizer: GlobalEqualizer | undefined;

  public nodes: SynthChannel[] = [];
  public instrumental = new InstrumentalNode();

  public bassConfig: BassConfig | undefined = undefined;

  private setInstrument: ((instrument: IPersetSoundfont[]) => void) | undefined;
  constructor(
    setInstrument?: (instrument: IPersetSoundfont[]) => void,
    systemConfig?: Partial<ConfigSystem>
  ) {
    this.setInstrument = setInstrument;
    this.startup(systemConfig);
  }

  async startup(systemConfig?: Partial<ConfigSystem>) {
    const audioContext = new AudioContext();

    const { Synthesizer } = await import("js-synthesizer");
    const synth = new Synthesizer();

    synth.init(audioContext.sampleRate);

    synth.setGain(0.3);

    this.loadDefaultSoundFont();

    this.synth = synth;
    this.audio = audioContext;

    this.player = new JsSynthPlayerEngine(synth);
    this.instrumental.setEngine(this);

    const analysers: AnalyserNode[] = [];
    this.nodes = [];

    const finalOutputNode = synth.createAudioNode(audioContext, 8192);

    this.globalEqualizer = new GlobalEqualizer(finalOutputNode.context);
    finalOutputNode.connect(this.globalEqualizer.input);
    this.globalEqualizer.output.connect(audioContext.destination);

    for (let ch = 0; ch < CHANNEL_DEFAULT.length; ch++) {
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      this.nodes.push(
        new SynthChannel(
          ch,
          this.instrumental,
          audioContext,
          undefined,
          systemConfig
        )
      );
      this.nodes[ch].setVelocityRender(true);
      analysers.push(analyser);
    }

    this.controllerChange();
    this.programChange();
    this.noteOffChange();
    this.noteOnChange();

    return { synth: synth, audio: this.audio };
  }

  async loadPresetSoundFont(sfId?: number) {
    if (!sfId) {
      return [];
    }

    const preset = await this.synth?.getSFontObject(sfId);
    if (preset) {
      const list = await preset.getPresetIterable();
      const presetList = Array.from(list);

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

  async setSoundFont(file: File, from: SoundSystemMode) {
    const bf = await file.arrayBuffer();
    try {
      const sfId = await this.synth?.loadSFont(bf);
      this.soundfontName = file.name;
      this.soundfontFrom = from;
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
          this.nodes[e.channel].controllerChange(e);
          callback?.(e);
        },
      });
    }
  }

  noteOffChange(callback?: (event: INoteChange) => void): void {
    const notes = this.nodes;
    if (this.player?.addEvent) {
      this.player.addEvent({
        onNoteOffChangeCallback: (e) => {
          notes[e.channel].noteOffChange(e);
          callback?.(e);
        },
      });
    }
  }

  noteOnChange(callback?: (event: INoteChange) => void): void {
    const notes = this.nodes;
    if (this.player?.addEvent) {
      this.player.addEvent({
        onNoteOnChangeCallback: (e) => {
          notes[e.channel].noteOnChange(e);
          callback?.(e);
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

  updateSpeed(value: number) {}
  setBassLock(program: number): void {
    this.bassConfig?.setLockBass(program);
    const bass = this.instrumental.group.get("bass");
    bass?.forEach((node) => {
      if (node.channel !== undefined) {
        this.setProgram({ channel: node.channel, program });
      }
    });
  }
  async unintsall() {
    this.audio?.suspend();
  }
}
