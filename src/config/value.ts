import { ConfigDisplay } from "@/stores/config/types/config.type";

export const WALLPAPER = "wallpaper-3.png";
export const DEFAULT_SOUND_FONT = "default-sound-font.sf2";
export const MID_FILE_TYPE = "mid";
export const CUR_FILE_TYPE = "cur";
export const LYR_FILE_TYPE = "lyr";
export const EMK_FILE_TYPE = "emk";

export const STORAGE_SOUNDFONT = "soundfont";
export const STORAGE_WALLPAPER = "wallpaper";

export const STORAGE_USER_SONG = "user_song";
export const STORAGE_USER_TRACKLIST = "user_tracklist";

export const STORAGE_EXTREME_TRACKLIST = "extreme_tracklist";
export const STORAGE_EXTREME_SONG = "extreme_song";

export const STORAGE_DRIVE_SONG = "drive_user_song";
export const STORAGE_DRIVE_TRACKLIST_SONG = "drive_user_tracklist";

export const STORAGE_DRIVE_EXTREME_SONG = "drive_extreme_song";
export const STORAGE_DRIVE_EXTREME_TRACKLIST = "drive_extreme_tracklist";

export const EMK_TYPE = "EMK";
export const NCN_TYPE = "NCN";
export const SONG_TYPE = { 0: EMK_TYPE, 1: NCN_TYPE };

export const CUSTOM_SONG_ZIP = "u";
export const CUSTOM_DRIVE_SONG_ZIP = "d";

export const CHANNEL_DEFAULT: number[] = Array(16).fill(0);
export const CHANNEL_BOOLEAN: boolean[] = Array(16).fill(false);
export const VOLUME_DEFAULT: number[] = Array(16).fill(100);
export const VOLUME_MIDDLE_DEFAULT_128: number[] = Array(16).fill(64);
export const VOLUME_MIDDLE_DEFAULT_100: number[] = Array(16).fill(50);

export const BASE_PROGRAM: number[] = [32, 33, 34, 35, 36, 37, 38, 39];

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
    font: "เริ่มต้น",
    fontSize: 30,
    fontAuto: true,
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
  system: {
    drive: false,
    tracklistUrl: "",
    url: "",
    urlTested: false,
    tracklistUrlTested: false,
    uploadToDrive: false,
    engine: "spessa",
    timingModeType: "Time",
  },
  sound: {},
};
