import { ConfigDisplay } from "@/features/config/types/config.type";

export const DRUM_CHANNEL = 9;
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

export const STORAGE_FONT = "user_font";

export const EMK_TYPE = "EMK";
export const NCN_TYPE = "NCN";
export const SONG_TYPE = { 0: EMK_TYPE, 1: NCN_TYPE };

export const CUSTOM_SONG_ZIP = "u";
export const CUSTOM_DRIVE_SONG_ZIP = "d";

export const CHANNEL_DEFAULT: number[] = Array(16).fill(0);
export const CHANNEL_BOOLEAN: boolean[] = Array(16).fill(false);
export const VOLUME_DEFAULT: number[] = Array(16).fill(100);
export const MAX_CHANNEL: number[] = Array(128).fill(0);
export const VOLUME_MIDDLE_DEFAULT_128: number[] = Array(16).fill(64);
export const VOLUME_MIDDLE_DEFAULT_100: number[] = Array(16).fill(50);

// 1. Piano
export const PIANO: number[] = [0, 1, 2, 3, 4, 5, 6, 7];

// 2. Chromatic Percussion
export const CHROMATIC_PERCUSSION: number[] = [8, 9, 10, 11, 12, 13, 14, 15];

// 3. Organ
export const ORGAN: number[] = [16, 17, 18, 19, 20, 21, 22, 23];

// 4. Guitar Clean
export const GUITAR_CLEAN: number[] = [24];

// 5. Guitar Nylon
export const GUITAR_NYLON: number[] = [25];

// 6. Guitar Jazz
export const GUITAR_JAZZ: number[] = [26, 27];

// 7. Guitar Overdriven
export const GUITAR_OVERDRIVEN: number[] = [29];

// 8. Guitar Distortion
export const GUITAR_DISTORTION: number[] = [30, 31];

// 9. Bass
export const BASS: number[] = [32, 33, 34, 35, 36, 37, 38, 39];

// 10. String
export const STRING: number[] = [40, 41, 42, 43, 44, 45, 46, 47];

// 11. Ensemble
export const ENSEMBLE: number[] = [48, 49, 50, 51, 52, 53, 54, 55];

// 12. Brass
export const BRASS: number[] = [56, 57, 58, 59, 60, 61, 62, 63];

// 13. Reed
export const REED: number[] = [64, 65, 66, 67, 68, 69, 70, 71];

// 14. Pipe
export const PIPE: number[] = [72, 73, 74, 75, 76, 77, 78, 79];

// 15. Synth Lead
export const SYNTH_LEAD: number[] = [80, 81, 82, 83, 84, 85, 86, 87];

// 16. Synth Pad
export const SYNTH_PAD: number[] = [88, 89, 90, 91, 92, 93, 94, 95];

// 17. Synth Effect
export const SYNTH_EFFECT: number[] = [96, 97, 98, 99, 100, 101, 102, 103];

// 18. Ethnic
export const ETHNIC: number[] = [104, 105, 106, 107, 108, 109, 110, 111];

// 19. Percussive
export const PERCUSSIVE: number[] = [112, 113, 114, 115, 116, 117, 118, 119];

// 20. Sound Effects
export const SOUND_EFFECTS: number[] = [120, 121, 122, 123, 124, 125, 126, 127];

export const PROGRAM_CATEGORY: number[][] = [
  PIANO,
  CHROMATIC_PERCUSSION,
  ORGAN,
  GUITAR_CLEAN,
  GUITAR_NYLON,
  GUITAR_JAZZ,
  GUITAR_OVERDRIVEN,
  GUITAR_DISTORTION,
  BASS,
  STRING,
  ENSEMBLE,
  BRASS,
  REED,
  PIPE,
  SYNTH_LEAD,
  SYNTH_PAD,
  SYNTH_EFFECT,
  ETHNIC,
  PERCUSSIVE,
  SOUND_EFFECTS,
];

export const REFRESH_RATE: { [key: string]: number } = {
  HIGH: 16, // 60Fps
  MIDDLE: 33, // 30Fps
  LOW: 50, // 20Fps
};

export const DEFAULT_CONFIG: ConfigDisplay = {
  refreshRate: {
    render: 100,
    // type: "MIDDLE",
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
