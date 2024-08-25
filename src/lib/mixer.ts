import { midiControllers, Synthetizer } from "spessasynth_lib";

export const volumeChange = (
  channel: number,
  vol: number,
  synth: Synthetizer
) => {
  synth.controllerChange(channel, midiControllers.mainVolume, vol);
};
