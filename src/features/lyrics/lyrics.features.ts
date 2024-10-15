import { DEFAULT_CONFIG } from "@/config/value";
import {
  Noto_Sans_Thai_Looped,
  Inter,
  Krub,
  Roboto,
  Lora,
} from "next/font/google";

const notoSansThaiLooped = Noto_Sans_Thai_Looped({
  weight: "400",
  subsets: ["latin", "thai", "latin-ext"],
});

const inter = Inter({
  weight: "400",
  subsets: ["latin"],
});

const krub = Krub({
  weight: "400",
  subsets: ["latin"],
});

const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
});

const lora = Lora({
  weight: "400",
  subsets: ["latin"],
});

export const lyricsGetFont = (get: SystemFont) => {
  let font = notoSansThaiLooped;
  switch (get) {
    case "inter":
      font = inter;
      break;
    case "lora":
      font = lora;
      break;
    case "notoSansThaiLooped":
      font = notoSansThaiLooped;
      break;
    case "roboto":
      font = roboto;
      break;
    case "krub":
      font = krub;
      break;

    default:
      font = notoSansThaiLooped;
      break;
  }
  return font;
};

export const lyricsConfig = (
  setConfig: (config: Partial<ConfigDisplay>) => void
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

  const setFontChange = (set: SystemFont) => {
    let font = notoSansThaiLooped;
    let fontName: SystemFont = "notoSansThaiLooped";
    switch (set) {
      case "inter":
        font = inter;
        fontName = "inter";
        break;
      case "lora":
        font = lora;
        fontName = "lora";
        break;
      case "notoSansThaiLooped":
        font = notoSansThaiLooped;
        fontName = "notoSansThaiLooped";
        break;
      case "roboto":
        font = roboto;
        fontName = "roboto";
        break;
      case "krub":
        font = krub;
        fontName = "krub";
        break;

      default:
        font = notoSansThaiLooped;
        fontName = "notoSansThaiLooped";
        break;
    }
    setConfig({ lyrics: { fontName } });
  };

  return {
    reset,
    setLyricsOptions,
    setLyricsColor,
    setLyricsColorBorder,
    setLyricsActiveColor,
    setLyricsActiveBorderColor,
    setFontChange,
  };
};
