type RefreshRate = "HIGH" | "MIDDLE" | "LOW";

interface ConfigDisplay {
  refreshRate: Partial<RefreshRateConfig>;
  lyrics: Partial<LyricsConfig>;
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
