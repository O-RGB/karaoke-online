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

  private setInstrument: ((instrument: IPersetSoundfont[]) => void) | undefined;
  constructor(setInstrument?: (instrument: IPersetSoundfont[]) => void) {
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

    if (audioContext) {
      const analysers = this.getAnalyserNode(audioContext);
      this.analysers = analysers;
    }

    node.connect(audioContext.destination);

    this.player = new JsSynthPlayerEngine(synth);

    return { synth: this.synth, audio: this.audio };
  }

  private getAnalyserNode(auto: AudioContext) {
    return Array.from({ length: 16 }, () => {
      const analyser = auto.createAnalyser();
      analyser.fftSize = 256;
      return analyser;
    });
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
