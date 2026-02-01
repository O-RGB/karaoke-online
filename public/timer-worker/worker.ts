import type {
  WorkerMessage,
  StartCommandPayload,
  SeekCommandPayload,
  TempoCommandPayload,
  PpqCommandPayload,
  ModeCommandPayload,
  DurationCommandPayload,
  PlaybackRatePayload,
  TimingMessage,
  TimingResponseMessage,
} from "./types";

import {
  startTick,
  stopTick,
  seekTo,
  reset,
  getElapsedSeconds,
  getCountdown,
  getBpm,
  setPpq,
  setMode,
  setDuration,
  setTempo,
  setPlaybackRate,
  accumulatedValue,
  mode,
  ppq,
} from "./timing";

// ─── Message Handler ────────────────────────────────────────────────────────

self.onmessage = (e: MessageEvent<WorkerMessage>): void => {
  const { command, value } = e.data;

  switch (command) {
    case "start": {
      const payload = value as StartCommandPayload | undefined;
      startTick(payload?.ppq, payload?.mode);
      break;
    }

    case "stop": {
      stopTick();
      break;
    }

    case "seek": {
      const seekValue = parseSeeValue(value);
      if (seekValue === null) {
        console.error("Invalid seek value:", value);
        break;
      }

      console.log("Seeking to:", seekValue);
      seekTo(seekValue);

      const message: TimingMessage = {
        type: mode,
        value: accumulatedValue,
        bpm: getBpm(),
        elapsedSeconds: Math.floor(getElapsedSeconds()),
        countdown: getCountdown(),
      };

      console.log("Sending seek message:", message);
      self.postMessage(message);
      break;
    }

    case "reset": {
      reset();
      break;
    }

    case "getTiming": {
      const response: TimingResponseMessage = {
        type: "timingResponse",
        value: accumulatedValue,
        bpm: getBpm(),
        elapsedSeconds: Math.floor(getElapsedSeconds()),
        countdown: getCountdown(),
      };
      self.postMessage(response);
      break;
    }

    case "updateTempo": {
      const payload = value as TempoCommandPayload | undefined;
      if (payload && typeof payload.mppq === "number") {
        setTempo(payload.mppq);
      }
      break;
    }

    case "updatePpq": {
      const payload = value as PpqCommandPayload | undefined;
      if (payload && typeof payload.ppq === "number" && payload.ppq !== ppq) {
        setPpq(payload.ppq);
      }
      break;
    }

    case "updateMode": {
      const payload = value as ModeCommandPayload | undefined;
      if (
        payload &&
        (payload.mode === "Tick" || payload.mode === "Time") &&
        payload.mode !== mode
      ) {
        setMode(payload.mode);
      }
      break;
    }

    case "updateDuration": {
      const payload = value as DurationCommandPayload | undefined;
      if (payload && typeof payload.duration === "number") {
        setDuration(payload.duration);
      }
      break;
    }

    case "updatePlaybackRate": {
      const payload = value as PlaybackRatePayload | undefined;
      if (payload && typeof payload.rate === "number") {
        setPlaybackRate(payload.rate);
      }
      break;
    }
  }
};

// ─── Internal ───────────────────────────────────────────────────────────────

function parseSeeValue(value: WorkerMessage["value"]): number | null {
  if (typeof value === "number") return value;
  if (value && typeof (value as SeekCommandPayload).value === "number") {
    return (value as SeekCommandPayload).value;
  }
  return null;
}
