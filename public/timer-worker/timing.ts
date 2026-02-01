// timing.ts

import type {
  TimingMode,
  TimingMessage,
  DisplayResponseMessage,
} from "./types";

// ─── State ──────────────────────────────────────────────────────────────────

let intervalId: ReturnType<typeof setInterval> | null = null;
let lastTickTime: number | null = null;

export let accumulatedValue: number = 0;
export let isRunning: boolean = false;
export let ppq: number = 480;
export let mode: TimingMode = "Time";
export let duration: number | null = null;
export let playbackRate: number = 1.0;

let mppq: number = 500000;
let ticksPerSecond: number = (ppq * 1000000) / mppq;

// ─── Setters ────────────────────────────────────────────────────────────────

export function setPpq(value: number): void {
  ppq = value;
  ticksPerSecond = (ppq * 1000000) / mppq;
}

export function setMode(value: TimingMode): void {
  mode = value;
  accumulatedValue = 0;
}

export function setDuration(value: number): void {
  duration = value;
}

export function setPlaybackRate(rate: number): void {
  playbackRate = rate;
}

export function setTempo(newMppq: number): void {
  mppq = newMppq;
  ticksPerSecond = (ppq * 1000000) / mppq;
}

// ─── Getters (Return เป็น Seconds เสมอ สำหรับ UI) ───────────────────────────

export function getBpm(): number {
  return Math.round(60000000 / mppq);
}

export function getElapsedSeconds(): number {
  if (mode === "Tick") {
    return accumulatedValue / ticksPerSecond;
  }
  return accumulatedValue;
}

export function getCountdown(): number {
  if (duration === null) return 0;
  const remaining = Math.max(0, duration - accumulatedValue);

  if (mode === "Tick") {
    return remaining / ticksPerSecond;
  }
  return remaining;
}

export function getTotalSeconds(): number {
  if (duration === null) return 0;
  if (mode === "Tick") {
    return duration / ticksPerSecond;
  }
  return duration;
}

// ─── Logic ──────────────────────────────────────────────────────────────────

export function reset(): void {
  accumulatedValue = 0;
  lastTickTime = null;
}

export function calculateSeekValue(seconds: number): number {
  if (mode === "Tick") {
    return seconds * ticksPerSecond;
  }
  return seconds;
}

export function seekTo(targetValue: number): void {
  accumulatedValue = targetValue;
  lastTickTime = performance.now();
}

export function startTick(initialPpq?: number, initialMode?: TimingMode): void {
  if (initialPpq) setPpq(initialPpq);
  if (initialMode) setMode(initialMode);

  if (isRunning) return;
  isRunning = true;
  lastTickTime = performance.now();

  intervalId = setInterval(tick, 50);
}

export function stopTick(): void {
  isRunning = false;
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  lastTickTime = null;
}

function tick(): void {
  if (!isRunning || lastTickTime === null) return;

  const now = performance.now();
  const deltaTime = now - lastTickTime;
  lastTickTime = now;

  const effectiveDeltaTime = deltaTime * playbackRate;

  if (mode === "Tick") {
    const elapsedTicks = (effectiveDeltaTime / 1000) * ticksPerSecond;
    accumulatedValue += elapsedTicks;
  } else {
    accumulatedValue += effectiveDeltaTime / 1000;
  }

  const bpm = getBpm();

  // ── Duration reached ───────────────────────
  if (duration !== null && accumulatedValue >= duration) {
    accumulatedValue = duration;

    // ส่งข้อมูล Engine
    self.postMessage({
      type: mode,
      value: accumulatedValue,
    } satisfies TimingMessage);

    // ส่งข้อมูล Display
    self.postMessage({
      type: "displayUpdate",
      bpm,
      elapsedSeconds: Math.floor(getElapsedSeconds()),
      countdown: 0,
      totalSeconds: Math.floor(getTotalSeconds()),
    } satisfies DisplayResponseMessage);

    stopTick();
    return;
  }

  // ── Regular Tick ───────────────────────────

  // 1. ส่งข้อมูลเข้า Engine (เร็ว, เล็ก)
  self.postMessage({
    type: mode,
    value: accumulatedValue,
  } satisfies TimingMessage);

  // 2. ส่งข้อมูลอัพเดท UI (แยกออกมา)
  self.postMessage({
    type: "displayUpdate",
    bpm,
    elapsedSeconds: Math.floor(getElapsedSeconds()),
    countdown: Math.floor(getCountdown()),
    totalSeconds: Math.floor(getTotalSeconds()),
  } satisfies DisplayResponseMessage);
}
