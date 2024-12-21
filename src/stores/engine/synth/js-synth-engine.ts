import { DEFAULT_SOUND_FONT } from "@/config/value";
import { JsSynthPlayerEngine } from "../player/js-synth-player";

import {
  BaseSynthEngine,
  BaseSynthPlayerEngine,
  IControllerChange,
  IProgramChange,
  TimingModeType,
} from "../types/synth.type";
import { Synthesizer as JsSynthesizer } from "js-synthesizer";

export class JsSynthEngine implements BaseSynthEngine {
  public time: TimingModeType = "Tick";
  public synth: JsSynthesizer | undefined;
  public audio: AudioContext | undefined;
  public player: BaseSynthPlayerEngine | undefined;
  public preset: number[] = [];
  public analysers: AnalyserNode[] = [];
  public soundfontName: string | undefined;
  public soundfontFile: File | undefined;
  public bassLocked: number | undefined = undefined;

  constructor(setInstrument?: (instrument: IPersetSoundfont[]) => void) {
    this.startup();
  }

  async startup(setInstrument?: (instrument: IPersetSoundfont[]) => void) {
    const audioContext = new AudioContext();

    const { Synthesizer } = await import("js-synthesizer");
    const synth = new Synthesizer();

    synth.init(audioContext.sampleRate);

    const node = synth.createAudioNode(audioContext, 8192);
    node.connect(audioContext.destination);

    synth.setGain(0.3);

    this.loadDefaultSoundFont();

    this.synth = synth;
    this.audio = audioContext;

    if (audioContext) {
      const analysers = this.getAnalyserNode(audioContext);
      this.analysers = analysers;
    }

    this.player = new JsSynthPlayerEngine(synth);

    return { synth: this.synth, audio: this.audio };
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

    await this.synth?.loadSFont(arraybuffer);
    this.soundfontName = "Default Soundfont sf2";
  }

  getAnalyserNode(auto: AudioContext) {
    return Array.from({ length: 16 }, () => {
      const analyser = auto.createAnalyser();
      analyser.fftSize = 256;
      return analyser;
    });
  }

  async setSoundFont(file: File) {
    const bf = await file.arrayBuffer();
    try {
      this.synth?.loadSFont(bf);
      this.soundfontName = file.name;
      return true;
    } catch (error) {
      return false;
    }
  }

  controllerChange(callback: (event: IControllerChange) => void): void {
    if (this.player?.addEvent) {
      this.player.addEvent({ controllerChangeCallback: callback });
    }
  }
  persetChange(): void {}
  programChange(callback: (event: IProgramChange) => void): void {
    if (this.player?.addEvent) {
      this.player.addEvent({ programChangeCallback: callback });
    }
  }

  setMidiOutput(): void {}

  setController(
    channel: number,
    controllerNumber: number,
    controllerValue: number,
    force?: boolean
  ): void {
    this.synth?.midiControl(channel, controllerNumber, controllerValue);
  }

  lockController(
    channel: number,
    controllerNumber: number,
    isLocked: boolean
  ): void {}
  updatePitch(channel: number, semitones?: number): void {}
  updatePreset(channel: number, value: number): void {}

  setProgram(
    channel: number,
    programNumber: number,
    userChange?: boolean
  ): void {}

  setMute(channel: number, mute: boolean): void {}

  setBassLocked(bassNumber: number): void {}
}
