export const WALLPAPER = "wallpaper-3.png";
export const DEFAULT_SOUND_FONT = "default-sound-font.sf2";
export const MID_FILE_TYPE = "mid";
export const CUR_FILE_TYPE = "cur";
export const LYR_FILE_TYPE = "lyr";
export const EMK_FILE_TYPE = "emk";

export const STORAGE_KARAOKE_EXTREME = "karaoke_extreme";
export const STORAGE_USER_SONG = "user_song";
export const STORAGE_TRACKLIST = "tracklist";
export const STORAGE_SOUNDFONT = "soundfont";
export const STORAGE_SOUNDFONT_DIC = "soundfont_dic";
export const STORAGE_WALLPAPER = "wallpaper";

export const STORAGE_DRIVE = "drive";
export const STORAGE_USER_DRIVE = "user_drive";

export const TRACKLIST_FILENAME = "song.json";

export const EMK_TYPE = "EMK";
export const NCN_TYPE = "NCN";
export const SONG_TYPE = { 0: EMK_TYPE, 1: NCN_TYPE };

export const CUSTOM_SONG_ZIP = "u";

export const CHANNEL_DEFAULT: number[] = Array(16).fill(0);
export const VOLUME_DEFAULT: number[] = Array(16).fill(100);

export const REFRESH_RATE: { [key: string]: number } = {
  HIGH: 16, // 60Fps
  MIDDLE: 33, // 30Fps
  LOW: 50, // 20Fps
};

export const DEFAULT_CONFIG: ConfigDisplay = {
  refreshRate: {
    render: REFRESH_RATE["MIDDLE"],
    type: "MIDDLE",
  },
  lyrics: {
    color: {
      color: "#fcfe17",
      colorBorder: "#0000FF",
    },
    active: {
      color: "#000000",
      colorBorder: "#ffffff",
    },
    font: "notoSansThaiLooped",
    lyricsMode: "default",
  },
  widgets: {
    clock: {
      show: true,
    },
    mix: {
      show: true,
    },
    tempo: {
      show: true,
    },
  },
  themes: {
    backgroundBlur: true,
    backgroundColor: {
      active: false,
      color: "rgba(255, 255, 255, 0.10)",
    },
  },
};
