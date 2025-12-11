export type InstrumentFamilyName =
  | "Piano"
  | "Chromatic Percussion"
  | "Organ"
  | "Guitar"
  | "Bass"
  | "Strings"
  | "Ensemble"
  | "Brass"
  | "Reed"
  | "Pipe"
  | "Synth Lead"
  | "Synth Pad"
  | "Synth Effect"
  | "Ethnic"
  | "Percussive"
  | "Sound Effects"
  | "Drums";

export const FAMILY_CONFIG: {
  name: InstrumentFamilyName;
  start: number;
  end: number;
}[] = [
  { name: "Piano", start: 0, end: 7 },
  { name: "Chromatic Percussion", start: 8, end: 15 },
  { name: "Organ", start: 16, end: 23 },
  { name: "Guitar", start: 24, end: 31 },
  { name: "Bass", start: 32, end: 39 },
  { name: "Strings", start: 40, end: 47 },
  { name: "Ensemble", start: 48, end: 55 },
  { name: "Brass", start: 56, end: 63 },
  { name: "Reed", start: 64, end: 71 },
  { name: "Pipe", start: 72, end: 79 },
  { name: "Synth Lead", start: 80, end: 87 },
  { name: "Synth Pad", start: 88, end: 95 },
  { name: "Synth Effect", start: 96, end: 103 },
  { name: "Ethnic", start: 104, end: 111 },
  { name: "Percussive", start: 112, end: 119 },
  { name: "Sound Effects", start: 120, end: 127 },
];
