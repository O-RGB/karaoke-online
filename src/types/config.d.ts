type RefreshRate = "HIGH" | "MIDDLE" | "LOW";

interface ConfigDisplay {
  refreshRate: Partial<RefreshRateConfig>;
  lyrics: Partial<LyricsConfig>;
  widgets: Partial<WidgetsConfig>;
  themes: Partial<ThemesConfig>;
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
  font?: LyricsFont;
  lyricsMode?: LyricsOptions;
}

interface LyricsColorConfig {
  color?: string;
  colorBorder?: string;
}
