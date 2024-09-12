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

export const getTicks = (player: Sequencer) => {
  const midiInfo = getMidiInfo(player);
  if (!midiInfo) {
    return;
  }
  let secondsPerBeat = 60.0 / midiInfo.tempo;
  let ticksPerSecond = midiInfo.ticksPerBeat / secondsPerBeat;
  let ticks = player.currentTime * ticksPerSecond;
  return Math.round(ticks);
};
