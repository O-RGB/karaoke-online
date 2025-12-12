// ─────────────────────────────────────────────
// Instrument Program Ranges (GM Standard)
// ─────────────────────────────────────────────

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

// 7. Guitar Muted
export const GUITAR_MUTED: number[] = [28];

// 8. Guitar Overdriven
export const GUITAR_OVERDRIVEN: number[] = [29];

// 9. Guitar Distortion
export const GUITAR_DISTORTION: number[] = [30, 31];

// 10. Bass
export const BASS: number[] = [32, 33, 34, 35, 36, 37, 38, 39];

// 11. String
export const STRING: number[] = [40, 41, 42, 43, 44, 45, 46, 47];

// 12. Ensemble
export const ENSEMBLE: number[] = [48, 49, 50, 51, 52, 53, 54, 55];

// 13. Brass
export const BRASS: number[] = [56, 57, 58, 59, 60, 61, 62, 63];

// 14. Reed
export const REED: number[] = [64, 65, 66, 67, 68, 69, 70, 71];

// 15. Pipe
export const PIPE: number[] = [72, 73, 74, 75, 76, 77, 78, 79];

// 16. Synth Lead
export const SYNTH_LEAD: number[] = [80, 81, 82, 83, 84, 85, 86, 87];

// 17. Synth Pad
export const SYNTH_PAD: number[] = [88, 89, 90, 91, 92, 93, 94, 95];

// 18. Synth Effect
export const SYNTH_EFFECT: number[] = [96, 97, 98, 99, 100, 101, 102, 103];

// 19. Ethnic
export const ETHNIC: number[] = [104, 105, 106, 107, 108, 109, 110, 111];

// 20. Percussive
export const PERCUSSIVE: number[] = [112, 113, 114, 115, 116, 117, 118, 119];

// 21. Sound Effects
export const SOUND_EFFECTS: number[] = [120, 121, 122, 123, 124, 125, 126, 127];

// ─────────────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────────────

export type InstrumentFamilyName =
  | "Piano"
  | "Chromatic Percussion"
  | "Organ"
  | "Guitar Clean"
  | "Guitar Nylon"
  | "Guitar Jazz"
  | "Guitar Muted"
  | "Guitar Overdriven"
  | "Guitar Distortion"
  | "Bass"
  | "String"
  | "Ensemble"
  | "Brass"
  | "Reed"
  | "Pipe"
  | "Synth Lead"
  | "Synth Pad"
  | "Synth Effect"
  | "Ethnic"
  | "Percussive"
  | "Sound Effects";

export type InstrumentDrumName =
  | "Kick"
  | "Snare"
  | "SideStick"
  | "Tom"
  | "HiHat"
  | "CowBell"
  | "Crash"
  | "Ride"
  | "Bongo"
  | "Conga"
  | "Timbale"
  | "HandClap"
  | "Tambourine"
  | "Splash"
  | "Vibraslap"
  | "Agogo"
  | "Cabasa"
  | "Maracas"
  | "Whistle"
  | "Guiro"
  | "Claves"
  | "WoodBlock"
  | "Cuica"
  | "Triangle"
  | "Shaker"
  | "Perc";

export type InstsKeysMap = InstrumentFamilyName | InstrumentDrumName;

// ─────────────────────────────────────────────
// Lists (for dropdowns or looping)
// ─────────────────────────────────────────────

export const INSTRUMENT_FAMILY_NAMES: InstrumentFamilyName[] = [
  "Piano",
  "Chromatic Percussion",
  "Organ",
  "Guitar Clean",
  "Guitar Nylon",
  "Guitar Jazz",
  "Guitar Muted",
  "Guitar Overdriven",
  "Guitar Distortion",
  "Bass",
  "String",
  "Ensemble",
  "Brass",
  "Reed",
  "Pipe",
  "Synth Lead",
  "Synth Pad",
  "Synth Effect",
  "Ethnic",
  "Percussive",
  "Sound Effects",
];

export const INSTRUMENT_DRUM_NAMES: InstrumentDrumName[] = [
  "Kick",
  "Snare",
  "SideStick",
  "Tom",
  "HiHat",
  "CowBell",
  "Crash",
  "Ride",
  "Bongo",
  "Conga",
  "Timbale",
  "HandClap",
  "Tambourine",
  "Splash",
  "Vibraslap",
  "Agogo",
  "Cabasa",
  "Maracas",
  "Whistle",
  "Guiro",
  "Claves",
  "WoodBlock",
  "Cuica",
  "Triangle",
  "Shaker",
  "Perc",
];

export const INSTS_KEYS_MAP: InstsKeysMap[] = [
  ...INSTRUMENT_FAMILY_NAMES,
  ...INSTRUMENT_DRUM_NAMES,
];
