import { DEFAULT_SOUND_FONT } from "@/config/value";
import { jsSynthesizerCurrentTime, setupJsSynthesizer } from "../lib/js-synthesizer";
import { JsSynthPlayerEngine } from "../player/js-synth-player";
import { SpessaPlayerEngine } from "../player/spessa-synth-player";

import { BaseSynthEngine, BaseSynthPlayerEngine } from "../types/synth.type";
import { Synthesizer as JsSynthesizer } from "js-synthesizer";

export class JsSynthEngine implements BaseSynthEngine {
  public synth: JsSynthesizer | undefined;
  public audio: AudioContext | undefined;
  public player: BaseSynthPlayerEngine | undefined;
  preset: number[] = [];
  analysers: AnalyserNode[] = [];
  soundfontName: string | undefined;
  soundfontFile: File | undefined;

  constructor(setInstrument?: (instrument: IPersetSoundfont[]) => void) {
    this.startup();
  }

  async startup(setInstrument?: (instrument: IPersetSoundfont[]) => void) {
    console.log(
      "%csrc/stores/engine/synth/js-synth-engine.ts:34 Setup JsSynthesizer",
      "color: #007acc;"
    );

    const audioContext = new AudioContext();

    const { Synthesizer } = await import("js-synthesizer");
    const synth = new Synthesizer();
    synth.init(audioContext.sampleRate);

    const node = synth.createAudioNode(audioContext, 8192);
    node.connect(audioContext.destination);

    synth.setGain(0.1);

    this.loadDefaultSoundFont();

    this.programChange();

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
      return true;
    } catch (error) {
      return false;
    }
  }

  controllerChange(): void {}
  persetChange(): void {}
  programChange(): void {
    this.synth?.hookPlayerMIDIEvents(function (s, type, event) {

      
      // const _bpm = (await synthesizer?.retrievePlayerBpm()) || 0;
      // const ticks = (await synthesizer?.retrievePlayerTotalTicks()) || 0;
      // const tempo = (await synthesizer?.retrievePlayerMIDITempo()) || 0;

      s.retrievePlayerTotalTicks();

      // const duration = (ticks / (_bpm * 1000)) * 60;
      // setBPM(_bpm);

      // if (event.getChannel() == 12) {
      // console.log("TYPE == " + type);
      // console.log("getChannel", event.getChannel());
      // console.log("getValue", event.getValue());
      // console.log("getVelocity", event.getVelocity());
      // console.log("getControl", event.getControl());
      // console.log("getProgram", event.getProgram());
      // console.log("###########");
      // }

      const conrtol = event.getControl();
      const channel = event.getChannel();

      if (type === 192) {
        // เครื่องดนตรี
        // updateInstrumentalControl(channel, event.getProgram());
      } else if (type == 176) {
        if (conrtol == 7) {
          //ระดับเสียง
          // let getData = sound[channel];
          // if (getData) {
          //   updateLevelControl(channel, event.getValue());
          // }
        } else if (conrtol == 10) {
          // updateVelocityControl(channel, event.getVelocity());
        }
      }

      return false;
    });
  }

  setMidiOutput(): void {}

  setController(
    channel: number,
    controllerNumber: number,
    controllerValue: number,
    force?: boolean
  ): void {}

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
}


