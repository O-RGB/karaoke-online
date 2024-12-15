import { MIDI } from "spessasynth_lib/@types/midi_parser/midi_loader";

export interface BaseSynthEngine {
  audio: AudioContext | undefined;
  player: BaseSynthPlayerEngine | undefined;
  analysers: AnalyserNode[];
  startup(): Promise<{ synth: any; audio?: AudioContext }>;
  startup(): void;
  setSoundFont(file: File): void;

  preset: number[];
  programChange(event: (event: IProgramChange) => void): void;
  controllerChange(event: (event: IControllerChange) => void): void;
  persetChange(event: (event: IPersetSoundfont[]) => void): void;
  loadDefaultSoundFont(audio?: AudioContext): Promise<any>;

  soundfontName: string | undefined;
  soundfontFile: File | undefined;

  setController(
    channel: number,
    controllerNumber: number,
    controllerValue: number,
    force?: boolean
  ): void;
  lockController(
    channel: number,
    controllerNumber: number,
    isLocked: boolean
  ): void;
  updatePreset(channel: number, value: number): void;
  updatePitch(channel: number | null, semitones?: number): void;
  setProgram(
    channel: number,
    programNumber: number,
    userChange?: boolean
  ): void;
}

export interface BaseSynthPlayerEngine {
  paused: boolean;
  isFinished: boolean;
  currentTime: number;
  midiData: MIDI | undefined;
  duration: number;
  play(): void;
  stop(): void;
  pause(): void;
  getCurrentTime(): Promise<number>;
  setCurrentTime(time: number): void;
  getCurrentTickAndTempo(
    timeDivision?: number,
    currentTime?: number,
    tempos?: ITempoChange[]
  ): Promise<{ tick: number; tempo: number }>;
  loadMidi(midi: File): Promise<MIDI>;
  setMidiOutput(output: MIDIOutput): void;
  resetMidiOutput(): void;
}

export interface IEventChange {
  channel: number;
}

export interface IProgramChange extends IEventChange {
  program: number;
}

export interface IControllerChange extends IEventChange {
  controllerNumber: number;
  controllerValue: number;
}

export interface IPersetSoundfont {
  bank: number;
  presetName: string;
  program: number;
}
