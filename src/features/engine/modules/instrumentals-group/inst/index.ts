import { INoteChange } from "@/features/engine/types/synth.type";
import { SynthControl } from "../../instrumentals/node";
import { InstrumentFamilyName, InstsKeysMap } from "../types";

export interface InstrumentalType {
  name: InstsKeysMap;
  keys: number[];
}

export class Instrumental {
  public inst: SynthControl<InstsKeysMap, INoteChange> | undefined = undefined;
  public gain?: SynthControl<"GAIN", number>;
  public defaultGain = 127;

  constructor(value: InstrumentalType) {
    this.inst = new SynthControl(undefined, value.name, 0, {
      channel: 0,
      midiNote: 0,
      velocity: 0,
    });

    this.gain = new SynthControl(undefined, "GAIN", 0, this.defaultGain);
  }

  public setGain(value: number): void {
    const v = Math.max(0, Math.min(127, Math.round(value)));
    this.gain?.setValue(v);
  }

  public noteOn(note: INoteChange): INoteChange {
    const gain = this.gain?.value ?? this.defaultGain;
    const velocity = note.velocity;
    const vNorm = velocity / 127;
    const CURVE = 0.75;
    const vShaped = Math.pow(vNorm, CURVE);
    let finalVelocity = Math.round(vShaped * gain);
    finalVelocity = Math.max(0, Math.min(gain, finalVelocity));

    const finalNote: INoteChange = {
      ...note,
      velocity: finalVelocity,
    };

    this.inst?.setValue(finalNote);
    return finalNote;
  }

  public noteOff(note: INoteChange): INoteChange {
    this.inst?.setValue({ ...note });
    return note;
  }
}
