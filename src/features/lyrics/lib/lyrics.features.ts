import { DEFAULT_CONFIG } from "@/config/value";
import { ConfigSystem } from "@/features/config/types/config.type";

export const lyricsConfig = (
  setConfig: (config: Partial<ConfigSystem>) => void
): any => {
  const reset = () => {
    setConfig({ lyrics: DEFAULT_CONFIG.lyrics });
  };

  const setLyricsOptions = (mode: LyricsOptions) => {
    setConfig({ lyrics: { lyricsMode: mode } });
  };

  const setLyricsColor = (color: string) => {
    setConfig({ lyrics: { color: { color } } });
  };

  const setLyricsColorBorder = (color: string) => {
    setConfig({ lyrics: { color: { colorBorder: color } } });
  };

  const setLyricsActiveColor = (color: string) => {
    setConfig({ lyrics: { active: { color: color } } });
  };
  const setLyricsActiveBorderColor = (color: string) => {
    setConfig({ lyrics: { active: { colorBorder: color } } });
  };

  const setFontSize = (px: number) => {
    setConfig({ lyrics: { fontSize: px } });
  };
  const setFontAuto = (set: boolean) => {
    setConfig({ lyrics: { fontAuto: set } });
  };

  return {
    reset,
    setLyricsOptions,
    setLyricsColor,
    setLyricsColorBorder,
    setLyricsActiveColor,
    setLyricsActiveBorderColor,
    setFontSize,
    setFontAuto,
  };
};
