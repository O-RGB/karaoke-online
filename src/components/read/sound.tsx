import soundFontPlayer from "soundfont-player";
import { instrumentNameToChannelMapping } from "../sound-font/config";
export const Music = (noteNumber: number, noteName: string) => {
  let getChannel = instrumentNameToChannelMapping[noteNumber];
  let tes = soundFontPlayer.instrument(new AudioContext(), getChannel);
  return tes;
  tes.then(function (midi: any) {
    midi.play(noteName);
  });
};
