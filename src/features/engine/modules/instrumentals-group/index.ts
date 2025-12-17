import { DRUM_CHANNEL } from "@/config/value";
import { INoteChange } from "../../types/synth.type";
import { Instrumental } from "./inst";
import {
  InstsKeysMap,
  InstrumentFamilyName,
  InstrumentDrumName,
  PIANO,
  CHROMATIC_PERCUSSION,
  GUITAR_NYLON,
  BASS,
  BRASS,
  ENSEMBLE,
  ETHNIC,
  GUITAR_CLEAN,
  GUITAR_DISTORTION,
  GUITAR_JAZZ,
  GUITAR_MUTED,
  GUITAR_OVERDRIVEN,
  ORGAN,
  PERCUSSIVE,
  PIPE,
  REED,
  SOUND_EFFECTS,
  STRING,
  SYNTH_EFFECT,
  SYNTH_LEAD,
  SYNTH_PAD,
} from "./types";
import { InstrumentsPresets } from "@/features/config/types/config.type";

export class InstrumentalsControl {
  public instrumentals: Map<InstsKeysMap, Instrumental> = new Map();

  constructor() {
    const list: { name: InstsKeysMap; keys: number[] }[] = [
      { name: "Piano", keys: PIANO },
      { name: "ChromaPerc", keys: CHROMATIC_PERCUSSION },
      { name: "Organ", keys: ORGAN },
      { name: "G.Clean", keys: GUITAR_CLEAN },
      { name: "G.Nylon", keys: GUITAR_NYLON },
      { name: "G.Jazz", keys: GUITAR_JAZZ },
      { name: "G.Muted", keys: GUITAR_MUTED },
      { name: "G.Overdrive", keys: GUITAR_OVERDRIVEN },
      { name: "G.Distort", keys: GUITAR_DISTORTION },
      { name: "Bass", keys: BASS },
      { name: "Strings", keys: STRING },
      { name: "Ensemble", keys: ENSEMBLE },
      { name: "Brass", keys: BRASS },
      { name: "Reed", keys: REED },
      { name: "Pipe", keys: PIPE },
      { name: "Lead", keys: SYNTH_LEAD },
      { name: "Pad", keys: SYNTH_PAD },
      { name: "SFX", keys: SYNTH_EFFECT },
      { name: "Ethnic", keys: ETHNIC },
      { name: "Perc", keys: PERCUSSIVE },
      { name: "FX", keys: SOUND_EFFECTS },
      { name: "Kick", keys: [] },
      { name: "Snare", keys: [] },
      { name: "Stick", keys: [] },
      { name: "Tom", keys: [] },
      { name: "HH", keys: [] },
      { name: "Cowbell", keys: [] },
      { name: "Crash", keys: [] },
      { name: "Ride", keys: [] },
      { name: "Bongo", keys: [] },
      { name: "Conga", keys: [] },
      { name: "Timbale", keys: [] },
      { name: "Clap", keys: [] },
      { name: "Tamb", keys: [] },
      { name: "Splash", keys: [] },
      { name: "Vibra", keys: [] },
      { name: "Agogo", keys: [] },
      { name: "Cabasa", keys: [] },
      { name: "Maraca", keys: [] },
      { name: "Whistle", keys: [] },
      { name: "Guiro", keys: [] },
      { name: "Clave", keys: [] },
      { name: "WoodBlk", keys: [] },
      { name: "Cuica", keys: [] },
      { name: "Triangle", keys: [] },
      { name: "Shaker", keys: [] },
      { name: "Perc", keys: [] },
    ];

    for (const item of list) {
      this.instrumentals.set(item.name, new Instrumental(item));
    }
  }

  public loadConfig(instPreset: InstrumentsPresets[], index: number = 0) {
    try {
      const saved = instPreset[index];
      const preset = saved.preset;
      for (let i = 0; i < preset.length; i++) {
        const set = preset[i];
        const inst = this.instrumentals.get(set.key);
        if (!inst) return;
        inst.setGain(set.value);
      }
    } catch (error) {}
  }

  public getPreset(value: number, label: string): InstrumentsPresets {
    let temp: InstrumentsPresets = {
      label,
      value,
      preset: [],
    };
    const insts = Array.from(this.instrumentals.keys());
    for (let i = 0; i < insts.length; i++) {
      const key = insts[i];
      const inst = this.instrumentals.get(key);
      if (!inst) return temp;
      const value = inst.gain?.value ?? 128;
      temp.preset.push({
        key,
        value,
      });
    }
    return temp;
  }

  public setPreset(value: number) {}

  public getInstrumentFamily(program: number): InstrumentFamilyName {
    switch (program) {
      // Piano (0-7)
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        return "Piano";

      // Chromatic Percussion (8-15)
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
      case 13:
      case 14:
      case 15:
        return "ChromaPerc";

      // Organ (16-23)
      case 16:
      case 17:
      case 18:
      case 19:
      case 20:
      case 21:
      case 22:
      case 23:
        return "Organ";

      // Guitar Clean (24)
      case 24:
        return "G.Clean";

      // Guitar Nylon (25)
      case 25:
        return "G.Nylon";

      // Guitar Jazz (26-27)
      case 26:
      case 27:
        return "G.Jazz";

      // Guitar Muted (28)
      case 28:
        return "G.Muted";

      // Guitar Overdriven (29)
      case 29:
        return "G.Overdrive";

      // Guitar Distortion (30-31)
      case 30:
      case 31:
        return "G.Distort";

      // Bass (32-39)
      case 32:
      case 33:
      case 34:
      case 35:
      case 36:
      case 37:
      case 38:
      case 39:
        return "Bass";

      // String (40-47)
      case 40:
      case 41:
      case 42:
      case 43:
      case 44:
      case 45:
      case 46:
      case 47:
        return "Strings";

      // Ensemble (48-55)
      case 48:
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
        return "Ensemble";

      // Brass (56-63)
      case 56:
      case 57:
      case 58:
      case 59:
      case 60:
      case 61:
      case 62:
      case 63:
        return "Brass";

      // Reed (64-71)
      case 64:
      case 65:
      case 66:
      case 67:
      case 68:
      case 69:
      case 70:
      case 71:
        return "Reed";

      // Pipe (72-79)
      case 72:
      case 73:
      case 74:
      case 75:
      case 76:
      case 77:
      case 78:
      case 79:
        return "Pipe";

      // Synth Lead (80-87)
      case 80:
      case 81:
      case 82:
      case 83:
      case 84:
      case 85:
      case 86:
      case 87:
        return "Lead";

      // Synth Pad (88-95)
      case 88:
      case 89:
      case 90:
      case 91:
      case 92:
      case 93:
      case 94:
      case 95:
        return "Pad";

      // Synth Effect (96-103)
      case 96:
      case 97:
      case 98:
      case 99:
      case 100:
      case 101:
      case 102:
      case 103:
        return "SFX";

      // Ethnic (104-111)
      case 104:
      case 105:
      case 106:
      case 107:
      case 108:
      case 109:
      case 110:
      case 111:
        return "Ethnic";

      // Percussive (112-119)
      case 112:
      case 113:
      case 114:
      case 115:
      case 116:
      case 117:
      case 118:
      case 119:
        return "Perc";

      // Sound Effects (120-127)
      case 120:
      case 121:
      case 122:
      case 123:
      case 124:
      case 125:
      case 126:
      case 127:
        return "FX";

      default:
        return "Piano";
    }
  }

  private getDrumName(note: number): InstrumentDrumName {
    switch (note) {
      case 35:
      case 36:
        return "Kick";
      case 38:
      case 40:
        return "Snare";
      case 37:
        return "Stick";
      case 39:
        return "Clap";
      case 42:
      case 44:
      case 46:
        return "HH";
      case 41:
      case 43:
      case 45:
      case 47:
      case 48:
      case 50:
        return "Tom";
      case 49:
      case 57:
        return "Crash";
      case 51:
      case 59:
        return "Ride";
      case 52:
        return "Crash";
      case 53:
        return "Ride";
      case 54:
        return "Timbale";
      case 55:
        return "Splash";
      case 56:
        return "Cowbell";
      case 58:
        return "Vibra";
      case 60:
      case 61:
        return "Bongo";
      case 62:
      case 63:
      case 64:
        return "Conga";
      case 65:
      case 66:
        return "Timbale";
      case 67:
      case 68:
        return "Agogo";
      case 69:
        return "Cabasa";
      case 70:
        return "Maraca";
      case 71:
      case 72:
        return "Whistle";
      case 73:
      case 74:
        return "Guiro";
      case 75:
        return "Clave";
      case 76:
      case 77:
        return "WoodBlk";
      case 78:
      case 79:
        return "Cuica";
      case 80:
      case 81:
        return "Triangle";
      case 82:
        return "Shaker";
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
