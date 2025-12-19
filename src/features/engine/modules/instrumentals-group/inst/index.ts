import { INoteChange } from "@/features/engine/types/synth.type";
import { SynthControl } from "../../instrumentals/node";
import { InstsKeysMap } from "../types";

export interface InstrumentalType {
  name: InstsKeysMap;
  keys: number[];
}

export class Instrumental {
  private static totalSoloCount = 0;

  public inst: SynthControl<InstsKeysMap, INoteChange> | undefined = undefined;

  public gain: SynthControl<"GAIN", number>;
  public mute: SynthControl<"MUTE", boolean>;
  public solo: SynthControl<"SOLO", boolean>;
  public lock: SynthControl<"LOCK", boolean>;

  public defaultGain = 127;

  constructor(value: InstrumentalType) {
    this.inst = new SynthControl(undefined, value.name, 0, {
      channel: 0,
      midiNote: 0,
      velocity: 0,
    });

    this.gain = new SynthControl(undefined, "GAIN", 0, this.defaultGain);
    this.mute = new SynthControl(undefined, "MUTE", 0, false);
    this.solo = new SynthControl(undefined, "SOLO", 0, false);
    this.lock = new SynthControl(undefined, "LOCK", 0, false);
  }

  public setGain(value: number): void {
    const v = Math.max(0, Math.min(127, Math.round(value)));
    this.gain.setValue(v);
  }

  public setMute(mute: boolean) {
    this.mute.setValue(mute);
  }

  public setLock(lock: boolean) {
    this.lock.setValue(lock);
  }

  public setSolo(solo: boolean) {
    const currentSolo = this.solo.value;
    if (currentSolo === solo) return;

    if (solo) {
      Instrumental.totalSoloCount++;
    } else {
      Instrumental.totalSoloCount--;
    }

    this.solo.setValue(solo);
  }

  public noteOn(note: INoteChange): INoteChange {
    const isMuted = this.mute.value;
    const isSolo = this.solo.value;
    const isLocked = this.lock.value;
    const gain = this.gain.value ?? this.defaultGain;

    if (isMuted) {
      const mutedNote = { ...note, velocity: 0 };
      this.inst?.setValue(mutedNote);
      return mutedNote;
    }

    if (Instrumental.totalSoloCount > 0 && !isSolo) {
      const mutedNote = { ...note, velocity: 0 };
      this.inst?.setValue(mutedNote);
      return mutedNote;
    }

    let finalVelocity = 0;

    if (isLocked) {
      finalVelocity = note.velocity === 0 ? 0 : gain;
    } else {
      const velocity = note.velocity;
      const vNorm = velocity / 127;
      const CURVE = 0.75;
      const vShaped = Math.pow(vNorm, CURVE);
      finalVelocity = Math.round(vShaped * gain);
    }

    finalVelocity = Math.max(0, Math.min(127, finalVelocity));

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

  public loadState(gain: number, mute: boolean, solo: boolean, lock: boolean) {
    this.setGain(gain);
    this.setMute(mute);
    this.setLock(lock);
    this.setSolo(solo);
  }
}
