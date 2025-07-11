import {
  ITrackData,
  KaraokeExtension,
} from "@/features/songs/types/songs.type";
import { MIDI } from "spessasynth_lib";

export interface PlayerProps {
  queue: QueuePlayerProps;
  runtime: RuntimeProps;
}

export interface QueuePlayerProps {
  loading: boolean;
  queue: ITrackData[];
  addQueue: (value: ITrackData) => void;
  removeQueue: (index: number) => void;
  moveQueue: (value: ITrackData[]) => void;
  playMusic: (index: number) => void;
  nextMusic: () => void;
}

export interface RuntimePlayer {
  setIsFinished: (value: boolean) => void;
  setCountDown: (value: number) => void;
  setCurrentTime: (value: number) => void;
  setMidiInfo: (
    cursors: number[],
    timeDivision: number,
    lyrics: string[],
    midi: MIDI,
    midiDecoded: KaraokeExtension,
    musicInfo: ITrackData
  ) => void;
  play: () => void;
  paused: () => void;
  stop: () => void;
  reset: () => void;
  uninstall: () => void;
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
  cursors: number[];
  timeDivision: number;
  midi?: MIDI;
  midiDecoded?: KaraokeExtension;
  musicInfo?: ITrackData;

  currentTick: number;
  currentTempo: number;
}

export type EventChangeType =
  | "SEARCH"
  | "SEARCH_LIST"
  | "SET_SONG"
  | "QUEUE"
  | "QUEUE_LIST"
  | "SET_QUEUE";

export type QueueChangeType = "NEXT" | "PAUSE";

export interface ISearchCallBack<T = any> {
  value: T;
  eventType: EventChangeType | QueueChangeType;
}
