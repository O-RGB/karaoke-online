type RefreshRate = "HIGH" | "MIDDLE" | "LOW";
type SystemFont =
  | "เริ่มต้น"
  | "notoSansThai"
  | "notoSerifThai"
  | "kanit"
  | "sarabun"
  | "prompt"
  | "mitr"
  | "pattaya"
  | "taviraj"
  | "charm"
  | "itim"
  | "pridi"
  | "mali"
  | "sriracha"
  | "athiti"
  | "trirong"
  | "koHo"
  | "niramit"
  | "srisakdi"
  | "chonburi"
  | "fahkwang"
  | "kodchasan"
  | "krub"
  | "charmonman"
  | "baiJamjuree"
  | "chakraPetch"
  | "thasadith"
  | "k2d"
  | "libreBaskerville";

interface ConfigDisplay {
  refreshRate: Partial<RefreshRateConfig>;
  lyrics: Partial<LyricsConfig>;
  widgets: Partial<WidgetsConfig>;
  themes: Partial<ThemesConfig>;
  system: Partial<SystemConfig>;
  sound: Partial<SoundSetting>;
}

interface SoundSetting {
  soundFont: string;
  lockBase: number;
}

interface SystemConfig {
  drive: boolean;
  url: string;
  urlTested: boolean;
  tracklistUrl: string;
  tracklistUrlTested: boolean;
}

interface ThemesConfig {
  backgroundBlur: boolean;
  backgroundColor: ThemesSettingConfig;
}
interface ThemesSettingConfig {
  active: boolean;
  color: string;
}

interface WidgetsConfig {
  mix?: WidgetsSettingConfig;
  tempo?: WidgetsSettingConfig;
  clock?: WidgetsSettingConfig;
}

interface WidgetsSettingConfig {
  show: boolean;
}

interface RefreshRateConfig {
  type: RefreshRate;
  render: number;
}

interface LyricsConfig {
  color?: LyricsColorConfig;
  active?: LyricsColorConfig;
  font?: string;
  fontSize?: number;
  fontAuto?: boolean;
  fontName?: SystemFont;
  lyricsMode?: LyricsOptions;
}

interface LyricsColorConfig {
  color?: string;
  colorBorder?: string;
}
