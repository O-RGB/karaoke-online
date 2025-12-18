import { INoteChange } from "@/features/engine/types/synth.type";
import { SynthControl } from "../../instrumentals/node";
import { InstsKeysMap } from "../types";

export interface InstrumentalType {
  name: InstsKeysMap;
  keys: number[];
}

export class Instrumental {
  // Static Counter เพื่อนับจำนวน Solo
  private static totalSoloCount = 0;

  public inst: SynthControl<InstsKeysMap, INoteChange> | undefined = undefined;

  // เปลี่ยน Gain และ Status ต่างๆ เป็น SynthControl ทั้งหมด
  public gain: SynthControl<"GAIN", number>;
  public mute: SynthControl<"MUTE", boolean>;
  public solo: SynthControl<"SOLO", boolean>;
  public lock: SynthControl<"LOCK", boolean>;

  public defaultGain = 127;

  constructor(value: InstrumentalType) {
    // Main Instrument Node
    this.inst = new SynthControl(undefined, value.name, 0, {
      channel: 0,
      midiNote: 0,
      velocity: 0,
    });

    // Controls
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
    // set value แล้ว event จะถูกยิงออกไปเอง
    this.mute.setValue(mute);
  }

  public setLock(lock: boolean) {
    this.lock.setValue(lock);
  }

  public setSolo(solo: boolean) {
    // ต้องเช็คก่อนค่าเปลี่ยน เพื่อจัดการ Static Counter
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
    // ดึงค่าจาก SynthControl.value
    const isMuted = this.mute.value;
    const isSolo = this.solo.value;
    const isLocked = this.lock.value;
    const gain = this.gain.value ?? this.defaultGain;

    // 1. Mute Logic
    if (isMuted) {
      const mutedNote = { ...note, velocity: 0 };
      this.inst?.setValue(mutedNote);
      return mutedNote;
    }

    // 2. Solo Logic (Global check)
    if (Instrumental.totalSoloCount > 0 && !isSolo) {
      const mutedNote = { ...note, velocity: 0 };
      this.inst?.setValue(mutedNote);
      return mutedNote;
    }

    let finalVelocity = 0;

    // 3. Lock / Curve Logic
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

  // Helper สำหรับโหลด Preset ถ้าจำเป็นต้องโหลดสถานะ M/S/L ด้วย
  public loadState(gain: number, mute: boolean, solo: boolean, lock: boolean) {
    this.setGain(gain);
    this.setMute(mute);
    this.setLock(lock);
    this.setSolo(solo);
  }
}
