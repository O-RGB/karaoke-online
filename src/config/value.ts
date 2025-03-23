import { ConfigDisplay } from "@/features/config/types/config.type";

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

// export const PIANOS: number[] = [0, 1, 2, 3, 4, 5, 6, 7];
// export const CHROMATIC_PERCUSSIONS: number[] = [8, 9, 10, 11, 12, 13, 14, 15];
// export const ORGANS: number[] = [16, 17, 18, 19, 20, 21];
// export const GUITARS: number[] = [24, 25, 26, 27, 28, 29, 30, 31];
// export const BASSES: number[] = [32, 33, 34, 35, 36, 37, 38, 39];
// export const STRINGS: number[] = [40, 41, 42, 43, 44, 45, 46, 47];
// export const ENSEMBLES: number[] = [48, 49, 50, 51, 52, 53, 54, 55];
// export const BRASS: number[] = [56, 57, 58, 59, 60, 61, 62, 63];
// export const REEDS: number[] = [64, 65, 66, 67, 68, 69, 70, 71];
// export const PIPES: number[] = [72, 73, 74, 75, 76, 77, 78, 79];
// export const SYNTH_LEADS: number[] = [80, 81, 82, 83, 84, 85, 86, 87];
// export const SYNTH_PADS: number[] = [88, 89, 90, 91, 92, 93, 94, 95];
// export const SYNTH_EFFECTS: number[] = [96, 97, 98, 99, 100, 101, 102, 103];
// export const ETHNIC: number[] = [104, 105, 106, 107, 108, 109, 110, 111];
// export const PERCUSSIVE: number[] = [112, 113, 114, 115, 116, 117, 118, 119];
// export const SOUND_EFFECTS: number[] = [120, 121, 122, 123, 124, 125, 126, 127];

export const PIANO: number[] = [0, 1, 2, 3, 4, 5, 6, 7];
export const ORGAN: number[] = [16, 17, 18, 19, 20];
export const ACCORDION: number[] = [21];
export const SYNTH: number[] = [5, 80];
export const BASS: number[] = [32, 33, 34, 35, 36, 37, 38, 39];
export const GUITAR_CLEAN: number[] = [24];
export const GUITAR_NYLON: number[] = [25];
export const GUITAR_JAZZ: number[] = [26];
export const GUITAR_OVERDRIVE: number[] = [29];
export const GUITAR_DISTORTION: number[] = [30];
export const STRINGS: number[] = [40];
export const VIOLIN: number[] = [41];
export const BRASS: number[] = [56, 58, 59, 60, 61, 62, 63];
export const TRUMPET: number[] = [57];
export const SYNTH_BASS: number[] = [38];
export const REED: number[] = [64];
export const SAX: number[] = [66];
export const PIPE: number[] = [72];
export const KICK: number[] = [35];
export const SNARE: number[] = [38];
export const STICK: number[] = [37];
export const TOM_LOW: number[] = [41];
export const TOM_MID: number[] = [43];
export const TOM_HIGH: number[] = [45];
export const HI_HAT: number[] = [42];
export const COWBELL: number[] = [56];

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
