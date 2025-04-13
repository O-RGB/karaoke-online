import { MIDI } from "spessasynth_lib/@types/midi_parser/midi_loader";
import { Synthesizer as JsSynthesizer } from "js-synthesizer";
import { Synthetizer as Spessasynth } from "spessasynth_lib";
import { AudioMeter } from "../lib/gain";
import { SynthChannel } from "../modules/instrumentals/channel";
import { InstrumentalNode } from "../modules/instrumentals/instrumental";
import { BassConfig } from "../modules/instrumentals/config";
export type TimingModeType = "Tick" | "Time";
export interface BaseSynthEngine {
  time: TimingModeType;
  audio: AudioContext | undefined;
  player: BaseSynthPlayerEngine | undefined;
  analysers: AnalyserNode[];
  synth: Spessasynth | JsSynthesizer | undefined;
  nodes?: SynthChannel[] | undefined;
  instrumental: InstrumentalNode | undefined;

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

  setController(event: IControllerChange, from?: string): void;
  lockController(event: IControllerChange<boolean>): void;
  updatePreset(channel: number, value: number): void;
  updatePitch(channel: number | null, semitones?: number): void;
  setProgram(event: IProgramChange): void;
  setVelocity(event: IVelocityChange): void;

  setMute(event: IControllerChange<boolean>): void;
  setupMIDIEventHook?(): void;

  gainNode?: AudioMeter;
  bassConfig?: BassConfig;
  setBassLock(program: number): void;
}
export interface BaseSynthEvent {
  controllerChangeCallback?: (event: IControllerChange) => void;
  programChangeCallback?: (event: IProgramChange) => void;
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
  setPlayBackRate?(rate: number): void;
  eventInit?: BaseSynthEvent;
}

export interface IEventChange {
  channel: number;
}

export interface IProgramChange extends IEventChange {
  program: number;
  userChange?: boolean;
}
export interface IVelocityChange extends IEventChange {
  value: number;
  userChange?: boolean;
}

export interface IControllerChange<T = number> extends IEventChange {
  controllerNumber: number;
  controllerValue: T;
  force?: boolean;
}

export interface INoteChange extends IEventChange {
  midiNote: number;
  velocity: number;
}

export interface INoteModifier extends Omit<INoteChange, "midiNote"> {}

export interface ILockController {
  channel: number;
  controllerNumber: number;
  isLocked: boolean;
}

export interface IMuteController {
  channel: number;
  isMute: boolean;
}

export interface IPersetSoundfont {
  bank: number;
  presetName: string;
  program: number;
}
