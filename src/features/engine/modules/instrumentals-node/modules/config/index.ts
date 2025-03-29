import { SoundSetting } from "@/features/config/types/config.type";
import {
  BaseSynthEngine,
  IProgramChange,
} from "@/features/engine/types/synth.type";
import { findProgramCategory } from "../instrumental/update";

export class BassConfig {
  public lockBase: number | undefined = undefined;
  public active: boolean = false;
  constructor(config: Partial<SoundSetting>) {
    this.lockBase = config.lockBase;
    if (config.lockBase) {
      this.active = true;
    }
  }

  setLockBass(value: number) {
    this.lockBase = value;
  }

  setActive(bool: boolean) {
    this.active = bool;
  }

  onProgramChange(
    event: IProgramChange,
    engine: BaseSynthEngine
  ): IProgramChange {
    if (!this.lockBase) return event;
    if (!this.active) return event;
    const find = findProgramCategory(event.program);
    if (find?.category === "bass") {
      const bass = { ...event, program: this.lockBase };
      engine.setProgram(bass);
      return bass;
    }

    return event;
  }
}
