import { MIDI } from "spessasynth_lib";

export interface PlayerProps {
  queue: QueuePlayerProps;
  runtime: RuntimeProps;
}

export interface QueuePlayerProps {
  queue: SearchResult[];
  addQueue: (value: SearchResult) => void;
  removeQueue: (index: number) => void;
  moveQueue: (value: SearchResult[]) => void;
  playMusic: (index: number) => void;
  nextMusic: () => void;
}

export interface RuntimePlayer {
  setIsFinished: (value: boolean) => void;
  setCountDown: (value: number) => void;
  setCurrentTime: (value: number) => void;
  setMidiInfo: (
    ticks: number[],
    ticksIndices: Map<number, number[]>,
    timeDivision: number,
    lyrics: string[],
    midi: MIDI,
    midiDecoded: SongFilesDecode,
    musicInfo: SearchResult
  ) => void;
  play: () => void;
  paused: () => void;
  stop: () => void;
  reset: () => void;
}

export interface RuntimeTick {
  tickRun: (isPlay: boolean) => void;
  intervalId?: NodeJS.Timeout;
}

export interface RuntimeValue {
  isPaused: boolean;
  isFinished: boolean;
  hasTransitioned: boolean;
  countDown: number;
  currentTime: number;
  currentTick: number;
}

export type RuntimeProps = RuntimePlayer &
  RuntimeValue &
  RuntimeTick &
  MidiPlayerProps;

export interface MidiPlayerProps {
  lyrics: string[];
  ticks: number[];
  ticksIndices: Map<number, number[]> | undefined;
  timeDivision: number;
  midi?: MIDI;
  midiDecoded?: SongFilesDecode;
  musicInfo?: SearchResult;

  currentTick: number;
  currentTempo: number;
}
