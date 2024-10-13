// tick-worker.js
let tempoChanges = [];
let timeList = [];
let timeDivision = 0;
let lastCurrentTime = 0;

self.onmessage = function(e) {
  const { type, data } = e.data;
  switch (type) {
    case 'init':
      timeDivision = data.timeDivision;
      tempoChanges = data.tempoChanges;
      timeList = convertTicksToTime(timeDivision, tempoChanges);
      break;
    case 'updateTime':
      lastCurrentTime = data.currentTime;
      updateTick();
      break;
    case 'start':
      startInterval(data.refreshRate);
      break;
    case 'stop':
      stopInterval();
      break;
  }
};

let intervalId = null;

function startInterval(refreshRate) {
  stopInterval();
  intervalId = setInterval(updateTick, refreshRate);
}

function stopInterval() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function updateTick() {
  if (timeList.length > 0) {
    const { tick, tempo } = calculateTicks(timeDivision, lastCurrentTime, timeList);
    self.postMessage({ type: 'tick', data: { tick, tempo } });
  }
}

function calculateTicks(timeDivision, currentTime, tempoChanges) {
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

function getTicks(timeDivision, time, tempo) {
  const secondsPerBeat = 60.0 / tempo;
  const ticksPerSecond = timeDivision / secondsPerBeat;
  return time * ticksPerSecond;
}

function convertTicksToTime(timeDivision, tempoChanges) {
  if (tempoChanges.length === 0) {
    return [];
  }
  let time = 0;
  let lastTicks = 0;
  let lastTempo = tempoChanges[0].tempo;

  const tempoTimeChanges = [];

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

function getTime(timeDivision, ticks, tempo) {
  const secondsPerBeat = 60.0 / tempo;
  const ticksPerSecond = timeDivision / secondsPerBeat;
  return ticks / ticksPerSecond;
}