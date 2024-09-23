import { Synthetizer } from "spessasynth_lib";

export const getSoundFontList = (synth: Synthetizer): ISoundFontList[] => {
  return synth.soundfontManager.soundfontList;
};

export const setSoundFont = async (file: File, synth: Synthetizer) => {
  const bf = await file.arrayBuffer();
  try {
    await synth.soundfontManager.reloadManager(bf);
    return true;
  } catch (error) {
    return false;
  }
};

export const deleteSoundFont = async (id: string, synth: Synthetizer) => {
  synth.soundfontManager.deleteSoundFont(id);
  return true;
};
