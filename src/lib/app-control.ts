import { MIDI, midiControllers, Sequencer, Synthetizer } from "spessasynth_lib";

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

export function getTicks(
  timeDivision: number,
  currentTime: number,
  tempo: number
): number {
  const secondsPerBeat = 60.0 / tempo;
  const ticksPerSecond = timeDivision / secondsPerBeat;
  return currentTime * ticksPerSecond;
}

export function groupThaiCharacters(text?: string): string[][] {
  if (!text) {
    return [];
  }
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

export const sortTempoChanges = (
  tempoChanges: ITempoChange[]
): ITempoChange[] => {
  return [...tempoChanges].sort((a, b) => a.ticks - b.ticks);
};

// export const ticksToTime = (
//   timeDivision: number,
//   tempoChanges: ITempoChange[]
// ) => {
//   let timeChange: ITempoTimeChange[] = [];
//   for (let list of tempoChanges) {
//     const time = getTimeFromTicks(timeDivision, list.ticks, list.tempo);
//     timeChange.push({
//       tempo: list.tempo,
//       time: time,
//     });
//   }
//   return timeChange;
// };

// Function to convert ticks to time
export function convertTicksToTime(
  timeDivision: number,
  tempoChanges: ITempoChange[]
): ITempoTimeChange[] {
  if (tempoChanges.length === 0) {
    return [];
  }
  let time = 0;
  let lastTicks = 0;
  let lastTempo = tempoChanges[0].tempo;

  const tempoTimeChanges: ITempoTimeChange[] = [];

  for (const change of tempoChanges) {
    // Calculate time for each tick change
    time += getTime(timeDivision, change.ticks - lastTicks, lastTempo);

    // Store the calculated time and tempo
    tempoTimeChanges.push({
      time: Math.round(time * 100) / 100,
      tempo: change.tempo,
    });

    lastTicks = change.ticks;
    lastTempo = change.tempo;
  }

  return tempoTimeChanges;
}

function getTime(timeDivision: number, ticks: number, tempo: number): number {
  const secondsPerBeat = 60.0 / tempo; // Seconds per beat (quarter note)
  const ticksPerSecond = timeDivision / secondsPerBeat; // Ticks per second
  return ticks / ticksPerSecond; // Convert ticks to seconds
}

// Function to calculate ticks
export function calculateTicks(
  timeDivision: number,
  currentTime: number,
  tempoChanges: ITempoTimeChange[]
) {
  let ticks = 0;
  let lastTime = 0;
  let lastTempo = tempoChanges[0].tempo;

  for (const change of tempoChanges) {
    if (currentTime > change.time) {
      ticks += getTicks(timeDivision, change.time - lastTime, lastTempo);
      lastTime = change.time;
      lastTempo = change.tempo;
    } else {
      break;
    }
  }

  ticks += getTicks(timeDivision, currentTime - lastTime, lastTempo);
  return { tick: Math.round(ticks), tempo: lastTempo };
}
