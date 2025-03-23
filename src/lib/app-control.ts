import { Sequencer } from "spessasynth_lib";

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

export const sortTempoChanges = (
  tempoChanges: ITempoChange[]
): ITempoChange[] => {
  return [...tempoChanges].sort((a, b) => a.ticks - b.ticks);
};

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
    time += getTime(timeDivision, change.ticks - lastTicks, lastTempo);

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
  const secondsPerBeat = 60.0 / tempo;
  const ticksPerSecond = timeDivision / secondsPerBeat;
  return ticks / ticksPerSecond;
}

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

export function timeToTick(
  timeDivision: number,
  timeInSeconds: number,
  tempoChanges: ITempoTimeChange[]
): number {
  let ticks = 0;
  let lastTime = 0;
  let lastTempo = tempoChanges[0].tempo;

  for (const change of tempoChanges) {
    if (timeInSeconds > change.time) {
      ticks += getTicks(timeDivision, change.time - lastTime, lastTempo);
      lastTime = change.time;
      lastTempo = change.tempo;
    } else {
      break;
    }
  }

  ticks += getTicks(timeDivision, timeInSeconds - lastTime, lastTempo);

  return Math.round(ticks);
}

export function currentTickToTime(
  timeDivision: number,
  currentTick: number,
  tempoChanges: ITempoTimeChange[]
): number {
  let time = 0;
  let lastTicks = 0;
  let lastTempo = tempoChanges[0].tempo;

  for (const change of tempoChanges) {
    if (currentTick > change.time) {
      time += getTime(timeDivision, change.time - lastTicks, lastTempo);
      lastTicks = change.time;
      lastTempo = change.tempo;
    } else {
      break;
    }
  }

  time += getTime(timeDivision, currentTick - lastTicks, lastTempo);

  return Math.round(time * 100) / 100;
}
