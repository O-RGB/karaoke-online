import { MIDI, midiControllers, Sequencer, Synthetizer } from "spessasynth_lib";

export const volumeChange = (
  channel: number,
  vol: number,
  synth: Synthetizer
) => {
  synth.controllerChange(channel, midiControllers.mainVolume, vol);
};

export const getMidiInfo = (player: Sequencer) => {
  const ticksPerBeat = player.midiData.timeDivision;
  const tempoChanges = player.midiData.tempoChanges;
  if (tempoChanges !== undefined && ticksPerBeat !== undefined) {
    const tempo = tempoChanges[0].tempo;
    return {
      ticksPerBeat,
      tempoChanges,
      tempo,
    };
  }
};

export const getTimeFromTicks = (
  timeDivision: number,
  ticks: number,
  tempo: number
) => {
  let secondsPerBeat = 60.0 / tempo;
  let ticksPerSecond = timeDivision / secondsPerBeat;
  let timeInSeconds = ticks / ticksPerSecond;
  return timeInSeconds;
};

export const getTicks = (
  timeDivision: number,
  currentTime: number,
  tempo: number
) => {
  let secondsPerBeat = 60.0 / tempo;
  let ticksPerSecond = timeDivision / secondsPerBeat;
  let ticks = currentTime * ticksPerSecond;
  console.log(`${ticks} = ${currentTime} * ${ticksPerSecond}, ${timeDivision}`);

  return Math.round(ticks);
};

 export const getTicksWithTempoChange = (
  timeDivision: number,
  currentTime: number,
  tempo: number,
  lastTempoChangeTime: number,
  previousTick: number
) => {
  let elapsedTime = currentTime - lastTempoChangeTime;
  let secondsPerBeat = 60.0 / tempo;
  let ticksPerSecond = timeDivision / secondsPerBeat;
  let ticksSinceLastTempoChange = elapsedTime * ticksPerSecond;
  return Math.round(previousTick + ticksSinceLastTempoChange);
};

export function groupThaiCharacters(text: string): string[][] {
  const groups: string[][] = [];
  let currentGroup: string[] = [];

  // Regular expressions to match Thai consonants, vowels, and tonal marks
  const consonantPattern = /[\u0E01-\u0E2E]/; // พยัญชนะไทย
  const vowelPattern = /[\u0E31-\u0E3A]/; // สระและวรรณยุกต์ที่อยู่บนล่างหรือข้างพยัญชนะ
  const toneMarkPattern = /[\u0E47-\u0E4C]/; // วรรณยุกต์ต่างๆ

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // If character is a consonant, start a new group
    if (consonantPattern.test(char)) {
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = [char];
    }
    // If character is a vowel or tone mark, add it to the current group
    else if (vowelPattern.test(char) || toneMarkPattern.test(char)) {
      currentGroup.push(char);
    } else {
      // In case of non-Thai characters, treat them separately
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
        currentGroup = [];
      }
      groups.push([char]);
    }
  }

  // Push the last group if there's any
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}
export const convertCursorToTicks = (
  ticksPerBeat: number,
  cursor: number[]
) => {
  if (ticksPerBeat === 0) {
    console.error("ticksPerBeat = 0");
    return [];
  }

  let curOnTick = cursor.map((data) => data * (ticksPerBeat / 24));
  return curOnTick;
};

export const mapCursorToIndices = (cursorPositions: number[]) => {
  const cursorMap = new Map<number, number[]>();

  cursorPositions.forEach((tick, charIndex) => {
    const indices = cursorMap.get(tick) || [];
    indices.push(charIndex);
    cursorMap.set(tick, indices);
  });

  return cursorMap;
};

type TempoChange = {
  ticks: number;
  tempo: number;
};

export const sortTempoChanges = (tempoChanges: TempoChange[]): TempoChange[] => {
  return [...tempoChanges].sort((a, b) => a.ticks - b.ticks);
};

const getTempoAtIndex = (sortedChanges: TempoChange[], index: number): number => {
  return sortedChanges[Math.min(index, sortedChanges.length - 1)].tempo;
};

const convertBetweenTickAndTime = (
  value: number,
  tempo: number,
  timeDivision: number,
  fromTicks: boolean
): number => {
  const secondsPerBeat = 60.0 / tempo;
  return fromTicks
    ? (value / timeDivision) * secondsPerBeat
    : (value / secondsPerBeat) * timeDivision;
};

export const calculateTimeAtTick = (
  targetTick: number,
  sortedChanges: TempoChange[],
  timeDivision: number
): { time: number; tempo: number } => {
  let currentTick = 0;
  let currentTime = 0;
  let currentTempoIndex = 0;

  while (currentTempoIndex < sortedChanges.length && targetTick > currentTick) {
    const nextChange = sortedChanges[currentTempoIndex];
    const ticksToNextChange = Math.min(nextChange.ticks - currentTick, targetTick - currentTick);

    const currentTempo = getTempoAtIndex(sortedChanges, currentTempoIndex);
    currentTime += convertBetweenTickAndTime(ticksToNextChange, currentTempo, timeDivision, true);
    currentTick += ticksToNextChange;

    if (currentTick === nextChange.ticks) currentTempoIndex++;
  }

  return {
    time: currentTime,
    tempo: getTempoAtIndex(sortedChanges, currentTempoIndex)
  };
};

export const calculateTickAtTime = (
  targetTime: number,
  sortedChanges: TempoChange[],
  timeDivision: number
): { tick: number; tempo: number } => {
  let currentTick = 0;
  let currentTime = 0;
  let currentTempoIndex = 0;

  while (currentTempoIndex < sortedChanges.length && targetTime > currentTime) {
    const currentTempo = getTempoAtIndex(sortedChanges, currentTempoIndex);
    const nextChangeTick = sortedChanges[currentTempoIndex + 1]?.ticks ?? Infinity;

    const timeToNextChange = convertBetweenTickAndTime(nextChangeTick - currentTick, currentTempo, timeDivision, true);

    if (currentTime + timeToNextChange > targetTime) {
      const remainingTime = targetTime - currentTime;
      currentTick += convertBetweenTickAndTime(remainingTime, currentTempo, timeDivision, false);
      return { tick: Math.round(currentTick), tempo: currentTempo };
    }

    currentTime += timeToNextChange;
    currentTick = nextChangeTick;
    currentTempoIndex++;
  }

  return {
    tick: Math.round(currentTick),
    tempo: getTempoAtIndex(sortedChanges, currentTempoIndex)
  };
};
