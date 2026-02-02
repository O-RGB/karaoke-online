// types.ts

export type TimingMode = "Tick" | "Time";

// [New] Interface for Time Signature
export interface TimeSignature {
  tick: number;
  numerator: number;
  denominator: number;
}

// [New] Interface for Beat Info (ส่งกลับ UI)
export interface BeatInfo {
  measure: number; // ห้องที่
  beat: number; // จังหวะที่
  subBeat: number; // เศษจังหวะ (0-1)
  numerator: number;
  denominator: number;
  isPreStart: boolean; // True ถ้ายังไม่ถึง First Note
}

// 1. Timing Message (Engine only)
export interface TimingMessage {
  type: TimingMode;
  value: number;
}

// 2. Display Message (UI only)
export interface DisplayResponseMessage {
  type: "displayUpdate";
  bpm: number;
  elapsedSeconds: number;
  countdown: number;
  totalSeconds: number;
  beatInfo: BeatInfo; // [New] แนบข้อมูลจังหวะ
}

// 3. Seek Response
export interface SeekResponseMessage {
  type: "seekResponse";
  seekValue: number;
  mode: TimingMode;
  bpm: number;
  elapsedSeconds: number;
  countdown: number;
  totalSeconds: number;
  beatInfo: BeatInfo; // [New]
}

// 4. Timing Response
export interface TimingResponseMessage {
  type: "timingResponse";
  value: number;
  bpm: number;
  elapsedSeconds: number;
  countdown: number;
  totalSeconds: number;
  beatInfo: BeatInfo; // [New]
}

export type WorkerResponseMessage =
  | TimingMessage
  | DisplayResponseMessage
  | SeekResponseMessage
  | TimingResponseMessage;

// Worker Commands
export interface StartCommandPayload {
  ppq?: number;
  mode?: TimingMode;
}
export interface SeekCommandPayload {
  value: number;
}
export interface TempoCommandPayload {
  mppq: number;
}
export interface PpqCommandPayload {
  ppq: number;
}
export interface ModeCommandPayload {
  mode: TimingMode;
}
export interface DurationCommandPayload {
  duration: number;
}
export interface PlaybackRatePayload {
  rate: number;
}
// [New] Command Payloads
export interface TimeSignaturesPayload {
  timeSignatures: TimeSignature[];
}
export interface FirstNotePayload {
  firstNote: number;
}

export type WorkerCommandPayload =
  | StartCommandPayload
  | SeekCommandPayload
  | TempoCommandPayload
  | PpqCommandPayload
  | ModeCommandPayload
  | DurationCommandPayload
  | PlaybackRatePayload
  | TimeSignaturesPayload // [New]
  | FirstNotePayload // [New]
  | number
  | undefined;

export interface WorkerMessage {
  command:
    | "start"
    | "stop"
    | "seek"
    | "reset"
    | "getTiming"
    | "updateTempo"
    | "updatePpq"
    | "updateMode"
    | "updateDuration"
    | "updatePlaybackRate"
    | "updateTimeSignatures" // [New]
    | "updateFirstNote"; // [New]
  value?: WorkerCommandPayload;
}
