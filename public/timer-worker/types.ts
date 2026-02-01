// ─── Timing ─────────────────────────────────────────────────────────────────

export type TimingMode = "Tick" | "Time";

export interface TimingMessage {
  type: TimingMode;
  value: number;
  bpm: number;
  countdown: number;
}

export interface TimingResponseMessage {
  type: "timingResponse";
  value: number;
  bpm: number;
  remainingTime: number;
}

export type WorkerResponseMessage = TimingMessage | TimingResponseMessage;

// ─── Worker Commands ────────────────────────────────────────────────────────

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

export type WorkerCommandPayload =
  | StartCommandPayload
  | SeekCommandPayload
  | TempoCommandPayload
  | PpqCommandPayload
  | ModeCommandPayload
  | DurationCommandPayload
  | PlaybackRatePayload
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
    | "updatePlaybackRate";
  value?: WorkerCommandPayload;
}
