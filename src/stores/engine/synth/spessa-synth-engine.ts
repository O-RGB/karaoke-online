import {
  modulatorSources,
  NON_CC_INDEX_OFFSET,
  Synthetizer as Spessasynth,
} from "spessasynth_lib";

import {
  BaseSynthEngine,
  BaseSynthPlayerEngine,
  IControllerChange,
  IProgramChange,
} from "../types/synth.type";
import { SpessaPlayerEngine } from "../player/spessa-synth-player";
import { loadAudioContext, loadPlayer } from "../lib/spessasynth";
import { DEFAULT_SOUND_FONT } from "@/config/value";

export class SpessaSynthEngine implements BaseSynthEngine {
  public synth: Spessasynth | undefined;
  public audio: AudioContext | undefined;
  public player: BaseSynthPlayerEngine | undefined;
  preset: number[] = [];
  analysers: AnalyserNode[] = [];
  soundfontName: string | undefined;
  soundfontFile: File | undefined;

  constructor(setInstrument?: (instrument: IPersetSoundfont[]) => void) {
    this.startup(setInstrument);
  }

  async startup(setInstrument?: (instrument: IPersetSoundfont[]) => void) {
    console.log(
      "%csrc/stores/engine/synth/spessa-synth-engine.ts:38 Setup Spessasynth",
      "color: #007acc;"
    );

    const { audioContext, channels } = await loadAudioContext();
    if (!audioContext)
      return { audio: undefined, synth: undefined, player: undefined };

    const synth = await this.loadDefaultSoundFont(audioContext);
    if (!synth)
      return { audio: undefined, synth: undefined, player: undefined };

    const player = await loadPlayer(synth);

    this.synth = synth;
    this.audio = audioContext;

    this.persetChange((e) => setInstrument?.(e));

    if (audioContext) {
      const analysers = this.getAnalyserNode(audioContext);
      synth?.connectIndividualOutputs(analysers);
      this.analysers = analysers;
    }

    this.player = new SpessaPlayerEngine(player);

    return { synth: this.synth, audio: this.audio };
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

        synthInstance.setMainVolume(0.7);
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

  controllerChange(event: (event: IControllerChange) => void): void {
    return this.synth?.eventHandler.addEvent("controllerchange", "", (e) =>
      event(e)
    );
  }

  programChange(event: (event: IProgramChange) => void): void {
    return this.synth?.eventHandler.addEvent("programchange", "", (e) =>
      event(e)
    );
  }

  persetChange(event: (event: IPersetSoundfont[]) => void): void {
    return this.synth?.eventHandler.addEvent(
      "presetlistchange",
      "",
      (perset: IPersetSoundfont[]) => {
        let sort = perset.sort((a, b) => a.program - b.program);
        sort = sort.filter((x, i) => i !== 1);
        event(sort);
      }
    );
  }

  setProgram(channel: number, programNumber: number, userChange?: boolean) {
    this.synth?.programChange(channel, programNumber, userChange);
  }
  setController(
    channel: number,
    controllerNumber: number,
    controllerValue: number,
    force?: boolean
  ): void {
    this.synth?.controllerChange(
      channel,
      controllerNumber,
      controllerValue,
      force
    );
  }

  lockController(
    channel: number,
    controllerNumber: number,
    isLocked: boolean
  ): void {
    this.synth?.lockController(channel, controllerNumber, isLocked);
  }

  updatePreset(channel: number, value: number): void {
    this.synth?.programChange(channel, value);
  }

  updatePitch(channel: number, semitones: number = 0): void {
    const PITCH_CENTER = 8192;
    const PITCH_RANGE = 16384;
    const SEMITONE_STEP = PITCH_RANGE / 24;
    const pitchValue = Math.max(
      0,
      Math.min(
        PITCH_RANGE - 1,
        Math.round(PITCH_CENTER + semitones * SEMITONE_STEP)
      )
    );
    const MSB = (pitchValue >> 7) & 0x7f;
    const LSB = pitchValue & 0x7f;
    const sendPitch = (channel: number) => {
      this.lockController(
        channel,
        NON_CC_INDEX_OFFSET + modulatorSources.pitchWheel,
        false
      );

      this.synth?.setPitchBendRange(channel, Math.abs(semitones));
      this.synth?.pitchWheel(channel, MSB, LSB);
      if (semitones !== 0) {
        this.lockController(
          channel,
          NON_CC_INDEX_OFFSET + modulatorSources.pitchWheel,
          true
        );
      }
    };
    if (channel !== null) {
      sendPitch(channel);
    } else {
      for (let i = 0; i < 16; i++) {
        sendPitch(i);
      }
    }
  }
}
