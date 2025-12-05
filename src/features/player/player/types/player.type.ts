import {
  ITrackData,
  KaraokeExtension,
} from "@/features/songs/types/songs.type";
import { MIDI } from "spessasynth_lib";

export interface PlayerProps {
  queue: QueuePlayerProps;
}

export interface QueuePlayerProps {
  loading: boolean;
  queue: ITrackData[];
  youtubePlyer?: boolean;
  addQueue: (value: ITrackData) => void;
  removeQueue: (index: number) => void;
  moveQueue: (value: ITrackData[]) => void;
  playMusic: (index: number) => void;
  nextMusic: () => void;
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
