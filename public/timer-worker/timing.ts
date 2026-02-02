import type {
  TimingMode,
  TimingMessage,
  DisplayResponseMessage,
  TimeSignature,
  BeatInfo,
} from "./types";

let intervalId: ReturnType<typeof setInterval> | null = null;
let lastTickTime: number | null = null;

export let accumulatedValue: number = 0;
export let isRunning: boolean = false;
export let ppq: number = 480;
export let mode: TimingMode = "Time";
export let duration: number | null = null;
export let playbackRate: number = 1.0;
export let firstNote: number = 0;

let mppq: number = 500000;
let ticksPerSecond: number = (ppq * 1000000) / mppq;

interface ProcessedTimeSignature extends TimeSignature {
  startMeasure: number;
}
let timeSignatures: ProcessedTimeSignature[] = [
  { tick: 0, numerator: 4, denominator: 4, startMeasure: 1 },
];

export function setPpq(value: number): void {
  ppq = value;
  ticksPerSecond = (ppq * 1000000) / mppq;
  _recalculateMeasureMap();
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

export function setFirstNote(tick: number): void {
  firstNote = tick;
}

export function setTimeSignatures(sigs: TimeSignature[]): void {
  if (!sigs || sigs.length === 0) {
    timeSignatures = [
      { tick: 0, numerator: 4, denominator: 4, startMeasure: 1 },
    ];
    return;
  }

  const sortedSigs = [...sigs].sort((a, b) => a.tick - b.tick);

  if (sortedSigs[0].tick > 0) {
    sortedSigs.unshift({ tick: 0, numerator: 4, denominator: 4 });
  }

  const processed: ProcessedTimeSignature[] = [];
  let currentMeasure = 1;

  for (let i = 0; i < sortedSigs.length; i++) {
    const sig = sortedSigs[i];
    if (i > 0) {
      const prevSig = processed[i - 1];
      const deltaTicks = sig.tick - prevSig.tick;

      const ticksPerBeat = ppq * (4 / prevSig.denominator);
      const ticksPerMeasure = ticksPerBeat * prevSig.numerator;

      currentMeasure += deltaTicks / ticksPerMeasure;
    }
    processed.push({ ...sig, startMeasure: currentMeasure });
  }
  timeSignatures = processed;
}

function _recalculateMeasureMap() {
  const rawSigs = timeSignatures.map(({ tick, numerator, denominator }) => ({
    tick,
    numerator,
    denominator,
  }));
  setTimeSignatures(rawSigs);
}

export function getBeatInfo(currentTick: number): BeatInfo {
  let sigIndex = 0;
  for (let i = timeSignatures.length - 1; i >= 0; i--) {
    if (currentTick >= timeSignatures[i].tick) {
      sigIndex = i;
      break;
    }
  }
  const sig = timeSignatures[sigIndex];

  const deltaTicks = currentTick - sig.tick;
  const ticksPerBeat = ppq * (4 / sig.denominator);
  const ticksPerMeasure = ticksPerBeat * sig.numerator;

  const elapsedMeasuresInSegment = Math.floor(deltaTicks / ticksPerMeasure);
  const remainderTicks = deltaTicks % ticksPerMeasure;

  const measure = Math.floor(sig.startMeasure + elapsedMeasuresInSegment);
  const beat = Math.floor(remainderTicks / ticksPerBeat) + 1;
  const subBeat = (remainderTicks % ticksPerBeat) / ticksPerBeat;

  const isPreStart = currentTick < firstNote;

  return {
    measure,
    beat,
    subBeat,
    numerator: sig.numerator,
    denominator: sig.denominator,
    isPreStart,
  };
}

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

  const currentTick = mode === "Tick" ? accumulatedValue : 0;
  const beatInfo = getBeatInfo(currentTick);

  if (duration !== null && accumulatedValue >= duration) {
    accumulatedValue = duration;

    self.postMessage({
      type: mode,
      value: accumulatedValue,
    } satisfies TimingMessage);

    self.postMessage({
      type: "displayUpdate",
      bpm,
      elapsedSeconds: Math.floor(getElapsedSeconds()),
      countdown: 0,
      totalSeconds: Math.floor(getTotalSeconds()),
      beatInfo,
    } satisfies DisplayResponseMessage);

    stopTick();
    return;
  }

  self.postMessage({
    type: mode,
    value: accumulatedValue,
  } satisfies TimingMessage);

  self.postMessage({
    type: "displayUpdate",
    bpm,
    elapsedSeconds: Math.floor(getElapsedSeconds()),
    countdown: Math.floor(getCountdown()),
    totalSeconds: Math.floor(getTotalSeconds()),
    beatInfo,
  } satisfies DisplayResponseMessage);
}
