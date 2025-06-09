import { EngineType } from "@/features/engine/synth-store";
import { TimingModeType } from "@/features/engine/types/synth.type";

export type RefreshRate = "HIGH" | "MIDDLE" | "LOW";
export type SystemFont =
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
export type SoundSystemMode =
  | "LOAD_JSON_FILE"
  | "EXTREME_FILE_SYSTEM"
  | "DRIVE_API"
  | "SERVER_API";

export interface ConfigSystem {
  refreshRate: Partial<RefreshRateConfig>;
  lyrics: Partial<LyricsConfig>;
  widgets: Partial<WidgetsConfig>;
  themes: Partial<ThemesConfig>;
  system: Partial<SystemConfig>;
  sound: Partial<SoundSetting>;
}

export interface MixerConfig {
  name: string;
  program: number[];
  value: number;
}
export interface SoundSetting {
  soundFont: string;
  lockBase: number;
  mixer: MixerConfig[];
  equalizer: boolean;
}

export interface SystemConfig {
  api: boolean;
  drive: boolean;
  url: string;
  urlTested: boolean;
  tracklistUrl: string;
  tracklistUrlTested: boolean;
  soundMode: SoundSystemMode;
  uploadToDrive: boolean;
  engine: EngineType;
  timingModeType: TimingModeType;
}

export interface ThemesConfig {
  backgroundBlur: boolean;
  backgroundColor: ThemesSettingConfig;
  wallpaperId: number;
}
export interface ThemesSettingConfig {
  active: boolean;
  color: string;
}

export interface WidgetsConfig {
  mix?: WidgetsSettingConfig;
  tempo?: WidgetsSettingConfig;
  clock?: WidgetsSettingConfig;
}

export interface WidgetsSettingConfig {
  show: boolean;
}

export interface RefreshRateConfig {
  // type: RefreshRate;
  render: number;
}

export interface LyricsConfig {
  color?: LyricsColorConfig;
  active?: LyricsColorConfig;
  font?: string;
  fontSize?: number;
  fontAuto?: boolean;
  fontName?: SystemFont;
  lyricsMode?: LyricsOptions;
}

export interface LyricsColorConfig {
  color?: string;
  colorBorder?: string;
}

export interface ConfigStoreProps {
  config: Partial<ConfigSystem>;
  setConfig: (
    config:
      | Partial<ConfigSystem>
      | ((config: Partial<ConfigSystem>) => Partial<ConfigSystem>)
  ) => void;
}
