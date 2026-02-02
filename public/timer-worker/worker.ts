// worker.ts

import type {
  WorkerMessage,
  StartCommandPayload,
  SeekCommandPayload,
  TempoCommandPayload,
  PpqCommandPayload,
  ModeCommandPayload,
  DurationCommandPayload,
  PlaybackRatePayload,
  TimingResponseMessage,
  SeekResponseMessage,
  TimeSignaturesPayload, // [New]
  FirstNotePayload, // [New]
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
  getTotalSeconds,
  calculateSeekValue,
  setTimeSignatures, // [New]
  setFirstNote, // [New]
  getBeatInfo, // [New] used for seek response
} from "./timing";

function parseSeeValue(value: WorkerMessage["value"]): number | null {
  if (typeof value === "number") return value;
  if (value && typeof (value as SeekCommandPayload).value === "number") {
    return (value as SeekCommandPayload).value;
  }
  return null;
}

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
      const inputSeconds = parseSeeValue(value);
      if (inputSeconds === null) {
        console.error("Invalid seek value:", value);
        break;
      }
      const targetSeekValue = calculateSeekValue(inputSeconds);
      seekTo(targetSeekValue);

      // Include beatInfo in response
      const currentTick = mode === "Tick" ? targetSeekValue : 0;

      const response: SeekResponseMessage = {
        type: "seekResponse",
        seekValue: targetSeekValue,
        mode: mode,
        bpm: getBpm(),
        elapsedSeconds: Math.floor(getElapsedSeconds()),
        countdown: Math.floor(getCountdown()),
        totalSeconds: Math.floor(getTotalSeconds()),
        beatInfo: getBeatInfo(currentTick), // [New]
      };
      self.postMessage(response);
      break;
    }
    case "reset": {
      reset();
      break;
    }
    case "getTiming": {
      const currentTick = mode === "Tick" ? accumulatedValue : 0;
      const message: TimingResponseMessage = {
        type: "timingResponse",
        value: accumulatedValue,
        bpm: getBpm(),
        elapsedSeconds: Math.floor(getElapsedSeconds()),
        countdown: Math.floor(getCountdown()),
        totalSeconds: Math.floor(getTotalSeconds()),
        beatInfo: getBeatInfo(currentTick), // [New]
      };
      self.postMessage(message);
      break;
    }
    case "updateTempo": {
      const payload = value as TempoCommandPayload | undefined;
      if (payload && typeof payload.mppq === "number") setTempo(payload.mppq);
      break;
    }
    case "updatePpq": {
      const payload = value as PpqCommandPayload | undefined;
      if (payload && typeof payload.ppq === "number" && payload.ppq !== ppq)
        setPpq(payload.ppq);
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
      if (payload && typeof payload.duration === "number")
        setDuration(payload.duration);
      break;
    }
    case "updatePlaybackRate": {
      const payload = value as PlaybackRatePayload | undefined;
      if (payload && typeof payload.rate === "number")
        setPlaybackRate(payload.rate);
      break;
    }
    // [New]
    case "updateTimeSignatures": {
      const payload = value as TimeSignaturesPayload | undefined;
      if (payload && Array.isArray(payload.timeSignatures)) {
        setTimeSignatures(payload.timeSignatures);
      }
      break;
    }
    // [New]
    case "updateFirstNote": {
      const payload = value as FirstNotePayload | undefined;
      if (payload && typeof payload.firstNote === "number") {
        setFirstNote(payload.firstNote);
      }
      break;
    }
  }
};
