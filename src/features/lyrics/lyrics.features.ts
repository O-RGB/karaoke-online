import {
  athiti,
  baiJamjuree,
  chakraPetch,
  charm,
  charmonman,
  chonburi,
  fahkwang,
  itim,
  k2d,
  kanit,
  kodchasan,
  koHo,
  krub,
  libreBaskerville,
  mali,
  mitr,
  niramit,
  notoSerifThai,
  pattaya,
  pridi,
  sarabun,
  sriracha,
  srisakdi,
  taviraj,
  thasadith,
  trirong,
  prompt,
} from "@/config/fonts";
import { DEFAULT_CONFIG } from "@/config/value";

export const lyricsGetFont = (get: SystemFont) => {
  let font = undefined;
  switch (get) {
    case "notoSerifThai":
      font = notoSerifThai;
      break;
    case "kanit":
      font = kanit;
      break;
    case "sarabun":
      font = sarabun;
      break;
    case "prompt":
      font = prompt;
      break;
    case "mitr":
      font = mitr;
      break;
    case "pattaya":
      font = pattaya;
      break;
    case "taviraj":
      font = taviraj;
      break;
    case "charm":
      font = charm;
      break;
    case "itim":
      font = itim;
      break;
    case "pridi":
      font = pridi;
      break;
    case "mali":
      font = mali;
      break;
    case "sriracha":
      font = sriracha;
      break;
    case "athiti":
      font = athiti;
      break;
    case "trirong":
      font = trirong;
      break;
    case "koHo":
      font = koHo;
      break;
    case "niramit":
      font = niramit;
      break;
    case "srisakdi":
      font = srisakdi;
      break;
    case "chonburi":
      font = chonburi;
      break;
    case "fahkwang":
      font = fahkwang;
      break;
    case "kodchasan":
      font = kodchasan;
      break;
    case "krub":
      font = krub;
      break;
    case "charmonman":
      font = charmonman;
      break;
    case "baiJamjuree":
      font = baiJamjuree;
      break;
    case "chakraPetch":
      font = chakraPetch;
      break;
    case "thasadith":
      font = thasadith;
      break;
    case "k2d":
      font = k2d;
      break;
    case "libreBaskerville":
      font = libreBaskerville;
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

  const setFontSize = (px: number) => {
    setConfig({ lyrics: { fontSize: px } });
  };
  const setFontAuto = (set: boolean) => {
    setConfig({ lyrics: { fontAuto: set } });
  };

  const setFontChange = (set: SystemFont) => {
    let font = undefined;
    let fontName: SystemFont = "เริ่มต้น";
    switch (set) {
      case "notoSerifThai":
        font = notoSerifThai;
        fontName = "notoSerifThai";
        break;
      case "kanit":
        font = kanit;
        fontName = "kanit";
        break;
      case "sarabun":
        font = sarabun;
        fontName = "sarabun";
        break;
      case "prompt":
        font = prompt;
        fontName = "prompt";
        break;
      case "mitr":
        font = mitr;
        fontName = "mitr";
        break;
      case "pattaya":
        font = pattaya;
        fontName = "pattaya";
        break;
      case "taviraj":
        font = taviraj;
        fontName = "taviraj";
        break;
      case "charm":
        font = charm;
        fontName = "charm";
        break;
      case "itim":
        font = itim;
        fontName = "itim";
        break;
      case "pridi":
        font = pridi;
        fontName = "pridi";
        break;
      case "mali":
        font = mali;
        fontName = "mali";
        break;
      case "sriracha":
        font = sriracha;
        fontName = "sriracha";
        break;
      case "athiti":
        font = athiti;
        fontName = "athiti";
        break;
      case "trirong":
        font = trirong;
        fontName = "trirong";
        break;
      case "koHo":
        font = koHo;
        fontName = "koHo";
        break;
      case "niramit":
        font = niramit;
        fontName = "niramit";
        break;
      case "srisakdi":
        font = srisakdi;
        fontName = "srisakdi";
        break;
      case "chonburi":
        font = chonburi;
        fontName = "chonburi";
        break;
      case "fahkwang":
        font = fahkwang;
        fontName = "fahkwang";
        break;
      case "kodchasan":
        font = kodchasan;
        fontName = "kodchasan";
        break;
      case "krub":
        font = krub;
        fontName = "krub";
        break;
      case "charmonman":
        font = charmonman;
        fontName = "charmonman";
        break;
      case "baiJamjuree":
        font = baiJamjuree;
        fontName = "baiJamjuree";
        break;
      case "chakraPetch":
        font = chakraPetch;
        fontName = "chakraPetch";
        break;
      case "thasadith":
        font = thasadith;
        fontName = "thasadith";
        break;
      case "k2d":
        font = k2d;
        fontName = "k2d";
        break;
      case "libreBaskerville":
        font = libreBaskerville;
        fontName = "libreBaskerville";
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
    setFontSize,
    setFontAuto,
  };
};
