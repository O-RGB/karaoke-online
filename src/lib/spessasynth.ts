import { DEFAULT_SOUND_FONT } from "@/config/value";

export const loadDefaultSoundFont = async () => {
  const response = await fetch(`/${DEFAULT_SOUND_FONT}`);
  const soundFontArrayBuffer = await response.arrayBuffer();
  return soundFontArrayBuffer;
};
