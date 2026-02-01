import type { TimingMode, TimingMessage } from "./types";

// ─── State ──────────────────────────────────────────────────────────────────

let intervalId: ReturnType<typeof setInterval> | null = null;
let lastTickTime: number | null = null;

export let accumulatedValue: number = 0;
export let isRunning: boolean = false;
export let ppq: number = 480;
export let mode: TimingMode = "Time";
export let duration: number | null = null;
export let playbackRate: number = 1.0;

let mppq: number = 500000; // default 120 BPM (60_000_000 / 120)
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

/**
 * Update tempo from MPPQ value received from MIDI player.
 * MPPQ = microseconds per quarter note (e.g. 500000 = 120 BPM)
 */
export function setTempo(newMppq: number): void {
  mppq = newMppq;
  ticksPerSecond = (ppq * 1000000) / mppq;
}

export function seekTo(value: number): void {
  accumulatedValue = value;
}

export function reset(): void {
  stopTick();
  accumulatedValue = 0;
  duration = null;
}

// ─── Tick Loop ──────────────────────────────────────────────────────────────

/**
 * Start the timing interval.
 */
export function startTick(startPpq?: number, startMode?: TimingMode): void {
  if (isRunning) return;

  if (startPpq && startPpq !== ppq) {
    setPpq(startPpq);
  }
  if (startMode) {
    mode = startMode;
  }

  isRunning = true;
  lastTickTime = performance.now();
  intervalId = setInterval(tick, 50);
}

/**
 * Stop the timing interval.
 */
export function stopTick(): void {
  isRunning = false;

  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }

  lastTickTime = null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Get current BPM derived from mppq.
 */
export function getBpm(): number {
  return 60000000 / mppq;
}

/**
 * Calculate elapsed seconds from accumulatedValue.
 * Tick mode: แปลง ticks → วินาที่ ผ่าน ticksPerSecond
 * Time mode: accumulatedValue คือวินาที่อยู่แล้ว
 */
export function getElapsedSeconds(): number {
  if (mode === "Tick") {
    return ticksPerSecond > 0 ? accumulatedValue / ticksPerSecond : 0;
  }
  return accumulatedValue;
}

/**
 * Calculate countdown (วินาที่คงเหลือ) จาก duration กับ elapsedSeconds.
 * คืน 0 ถ้า duration ยังไม่ set
 */
export function getCountdown(): number {
  if (duration === null) return 0;
  let totalDurationSeconds = duration;
  if (mode === "Tick") {
    totalDurationSeconds = ticksPerSecond > 0 ? duration / ticksPerSecond : 0;
  }
  const remaining = totalDurationSeconds - getElapsedSeconds();
  return remaining > 0 ? Math.floor(remaining) : 0;
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

  if (isNaN(accumulatedValue) || !isFinite(accumulatedValue)) {
    console.error(
      "Invalid accumulatedValue:",
      accumulatedValue,
      "deltaTime:",
      deltaTime,
      "effectiveDeltaTime:",
      effectiveDeltaTime
    );
    accumulatedValue = 0;
  }

  // ── Duration reached → send final message and stop ───────────────────────
  if (duration !== null && accumulatedValue >= duration) {
    accumulatedValue = duration;
    self.postMessage({
      type: mode,
      value: accumulatedValue,
      bpm,
      elapsedSeconds: getElapsedSeconds(),
      countdown: 0,
    } satisfies TimingMessage);
    stopTick();
    return;
  }

  // ── ส่ง message ทุก tick ─────────────────────────────────────────────────
  self.postMessage({
    type: mode,
    value: accumulatedValue,
    bpm,
    elapsedSeconds: Math.floor(getElapsedSeconds()),
    countdown: getCountdown(),
  } satisfies TimingMessage);
}
