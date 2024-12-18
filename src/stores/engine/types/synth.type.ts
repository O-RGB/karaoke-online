import { MIDI } from "spessasynth_lib/@types/midi_parser/midi_loader";
import { Synthesizer as JsSynthesizer } from "js-synthesizer";
import { Synthetizer as Spessasynth } from "spessasynth_lib";
export type TimingModeType = "Tick" | "Time";
export interface BaseSynthEngine {
  time: TimingModeType;
  audio: AudioContext | undefined;
  player: BaseSynthPlayerEngine | undefined;
  analysers: AnalyserNode[];
  synth: Spessasynth | JsSynthesizer | undefined;

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

  setMute(channel: number, isMuted: boolean): void;

  setupMIDIEventHook?(): void;
}

export interface BaseSynthEvent {
  controllerChangeCallback?: (event: IControllerChange) => void;
  programChangeCallback?: (event: IProgramChange) => void | undefined;
}

export interface BaseSynthPlayerEngine {
  paused: boolean;
  isFinished: boolean;
  currentTiming: number;
  midiData: MIDI | undefined;
  duration: number;
  play(): void;
  stop(): void;
  pause(): void;
  getCurrentTiming(): Promise<number>;
  setCurrentTiming(timeOrTick: number): void;
  getCurrentTickAndTempo(
    timeDivision?: number,
    currentTime?: number,
    tempos?: ITempoChange[]
  ): Promise<{ tick: number; tempo: number }>;
  loadMidi(midi: File): Promise<MIDI>;
  setMidiOutput(output: MIDIOutput): void;
  resetMidiOutput(): void;
  eventChange?(): void;
  addEvent?(input: Partial<BaseSynthEvent>): void;
  eventInit?: BaseSynthEvent;
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
