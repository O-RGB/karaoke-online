import {
  BASS,
  BRASS,
  CHROMATIC_PERCUSSION,
  DRUM_CHANNEL,
  ENSEMBLE,
  ETHNIC,
  GUITAR_CLEAN,
  GUITAR_DISTORTION,
  GUITAR_JAZZ,
  GUITAR_NYLON,
  GUITAR_OVERDRIVEN,
  ORGAN,
  PERCUSSIVE,
  PIANO,
  PIPE,
  REED,
  SOUND_EFFECTS,
  STRING,
  SYNTH_EFFECT,
  SYNTH_LEAD,
  SYNTH_PAD,
} from "@/config/value";
import { INoteChange } from "../../types/synth.type";
import { Instrumental } from "./inst";
import {
  InstsKeysMap,
  InstrumentFamilyName,
  InstrumentDrumName,
} from "./types";
export class InstrumentalsControl {
  public instrumentals: Map<InstsKeysMap, Instrumental> = new Map();

  constructor() {
    const list: { name: InstsKeysMap; keys: number[] }[] = [
      { name: "Piano", keys: PIANO },
      { name: "Chromatic Percussion", keys: CHROMATIC_PERCUSSION },
      { name: "Organ", keys: ORGAN },
      { name: "Guitar Clean", keys: GUITAR_CLEAN },
      { name: "Guitar Nylon", keys: GUITAR_NYLON },
      { name: "Guitar Jazz", keys: GUITAR_JAZZ },
      { name: "Guitar Overdriven", keys: GUITAR_OVERDRIVEN },
      { name: "Guitar Distortion", keys: GUITAR_DISTORTION },
      { name: "Bass", keys: BASS },
      { name: "String", keys: STRING },
      { name: "Ensemble", keys: ENSEMBLE },
      { name: "Brass", keys: BRASS },
      { name: "Reed", keys: REED },
      { name: "Pipe", keys: PIPE },
      { name: "Synth Lead", keys: SYNTH_LEAD },
      { name: "Synth Pad", keys: SYNTH_PAD },
      { name: "Synth Effect", keys: SYNTH_EFFECT },
      { name: "Ethnic", keys: ETHNIC },
      { name: "Percussive", keys: PERCUSSIVE },
      { name: "Sound Effects", keys: SOUND_EFFECTS },
      { name: "Sound Effects", keys: SOUND_EFFECTS },
      { name: "Kick", keys: [] },
      { name: "Snare", keys: [] },
      { name: "SideStick", keys: [] },
      { name: "Tom", keys: [] },
      { name: "HiHat", keys: [] },
      { name: "CowBell", keys: [] },
      { name: "Crash", keys: [] },
      { name: "Ride", keys: [] },
      { name: "Bongo", keys: [] },
      { name: "Conga", keys: [] },
      { name: "Timbale", keys: [] },
      { name: "Perc", keys: [] },
    ];

    for (const item of list) {
      this.instrumentals.set(item.name, new Instrumental(item));
    }
  }

  private getInstrumentFamily(program: number): InstrumentFamilyName {
    if (PIANO.includes(program)) return "Piano";
    if (CHROMATIC_PERCUSSION.includes(program)) return "Chromatic Percussion";
    if (ORGAN.includes(program)) return "Organ";
    if (GUITAR_CLEAN.includes(program)) return "Guitar Clean";
    if (GUITAR_NYLON.includes(program)) return "Guitar Nylon";
    if (GUITAR_JAZZ.includes(program)) return "Guitar Jazz";
    if (GUITAR_OVERDRIVEN.includes(program)) return "Guitar Overdriven";
    if (GUITAR_DISTORTION.includes(program)) return "Guitar Distortion";
    if (BASS.includes(program)) return "Bass";
    if (STRING.includes(program)) return "String";
    if (ENSEMBLE.includes(program)) return "Ensemble";
    if (BRASS.includes(program)) return "Brass";
    if (REED.includes(program)) return "Reed";
    if (PIPE.includes(program)) return "Pipe";
    if (SYNTH_LEAD.includes(program)) return "Synth Lead";
    if (SYNTH_PAD.includes(program)) return "Synth Pad";
    if (SYNTH_EFFECT.includes(program)) return "Synth Effect";
    if (ETHNIC.includes(program)) return "Ethnic";
    if (PERCUSSIVE.includes(program)) return "Percussive";
    if (SOUND_EFFECTS.includes(program)) return "Sound Effects";

    return "Piano";
  }

  // ไม่แตะส่วนกลองตามคำสั่งคุณ
  private getDrumName(note: number): InstrumentDrumName {
    switch (note) {
      case 35:
      case 36:
        return "Kick";
      case 38:
        return "Snare";
      case 37:
        return "SideStick";
      case 42:
      case 44:
      case 46:
        return "HiHat";
      case 41:
      case 43:
      case 45:
      case 47:
      case 48:
        return "Tom";
      case 49:
      case 57:
        return "Crash";
      case 51:
      case 52:
      case 53:
      case 59:
        return "Ride";
      case 56:
        return "CowBell";
      case 60:
      case 61:
        return "Bongo";
      case 62:
      case 63:
        return "Conga";
      case 65:
      case 66:
        return "Timbale";
    }
    return "Perc";
  }

  noteOn(event: INoteChange, program: number) {
    const key: InstsKeysMap =
      event.channel === DRUM_CHANNEL
        ? this.getDrumName(event.midiNote)
        : this.getInstrumentFamily(program);

    const inst = this.instrumentals.get(key);
    if (!inst) return event;

    const output = inst.noteOn(event);

    return output;
  }

  noteOff(event: INoteChange, program: number) {
    const key: InstsKeysMap =
      event.channel === DRUM_CHANNEL
        ? this.getDrumName(event.midiNote)
        : this.getInstrumentFamily(program);

    const inst = this.instrumentals.get(key);
    if (!inst) return event;

    return inst.noteOff(event);
  }

  get(value: InstsKeysMap) {
    return this.instrumentals.get(value);
  }
}
