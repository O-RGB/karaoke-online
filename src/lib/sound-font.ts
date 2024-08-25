import { Synthetizer } from "spessasynth_lib";

export const getSoundFontList = (synth: Synthetizer): ISoundFontList[] => {
  return synth.soundfontManager.soundfontList;
};

export const setSoundFont = async (file: File, synth: Synthetizer) => {
  const bf = await file.arrayBuffer();
  try {
    synth.soundfontManager.rearrangeSoundFonts([]);
    await synth.soundfontManager.addNewSoundFont(bf, file.name);
    return true;
  } catch (error) {
    return false;
  }
};

export const deleteSoundFont = async (id: string, synth: Synthetizer) => {
  synth.soundfontManager.deleteSoundFont(id);
  return true;
};

const setMainSoundFont = (id: string, synth: Synthetizer) => {
  const sf = synth.soundfontManager.soundfontList;
  if (sf.length > 0) {
    const findSf = sf.find((x) => x.id === id);
    if (!findSf) {
      return;
    }
  }
};
