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

let lastCountdownValue: number = -1;
let lastTickValueSent: number = -1;
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
  lastCountdownValue = -1;
}

export function setDuration(value: number): void {
  duration = value;
  lastCountdownValue = -1;
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
  lastCountdownValue = -1;
  lastTickValueSent = -1;
}

export function reset(): void {
  stopTick();
  accumulatedValue = 0;
  duration = null;
  lastCountdownValue = -1;
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
  lastCountdownValue = -1;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Calculate remaining time based on current mode.
 */
export function getRemainingTime(): number {
  if (duration === null) return 0;

  if (mode === "Time") {
    const remaining = duration - accumulatedValue;
    return remaining > 0 && isFinite(remaining) ? remaining : 0;
  }

  const remainingTicks = Math.max(0, duration - accumulatedValue);
  const timeRemaining =
    ticksPerSecond > 0 ? remainingTicks / (ticksPerSecond * playbackRate) : 0;

  return isFinite(timeRemaining) ? timeRemaining : 0;
}

/**
 * Get current BPM derived from mppq.
 */
export function getBpm(): number {
  return 60000000 / mppq;
}

/**
 * Reused by both tick() and seek handler.
 */
export function computeCountdown(remainingTime: number): number {
  const raw = remainingTime > 10 ? 10 : Math.ceil(remainingTime);

  if (isNaN(raw) || !isFinite(raw)) {
    console.error("Invalid countdown:", raw, "remainingTime:", remainingTime);
    return duration !== null
      ? Math.max(0, Math.ceil(duration - accumulatedValue))
      : 0;
  }

  return raw;
}

// ─── Internal ───────────────────────────────────────────────────────────────

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
      countdown: 0,
    } satisfies TimingMessage);
    stopTick();
    return;
  }

  // ── Normal tick → send message based on mode ─────────────────────────────
  const countdown = computeCountdown(getRemainingTime());

  if (mode === "Time") {
    self.postMessage({
      type: mode,
      value: accumulatedValue,
      bpm,
      countdown,
    } satisfies TimingMessage);
  } else {
    const currentTickValue = Math.floor(accumulatedValue);

    if (
      currentTickValue !== lastTickValueSent ||
      countdown !== lastCountdownValue
    ) {
      self.postMessage({
        type: mode,
        value: accumulatedValue,
        bpm,
        countdown,
      } satisfies TimingMessage);
      lastTickValueSent = currentTickValue;
    }
  }

  lastCountdownValue = countdown;
}
