import { SoundSetting } from "@/features/config/types/config.type";
import {
  BaseSynthEngine,
  IProgramChange,
} from "@/features/engine/types/synth.type";
import { findProgramCategory } from "../instrumental";

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

  onProgramChange(event: IProgramChange): {
    isBass: boolean;
    event: IProgramChange;
  } {
    if (!this.lockBase) return { isBass: false, event };
    if (!this.active) return { isBass: false, event };
    const find = findProgramCategory(event.program);
    if (find?.category === "bass") {
      const bass = { ...event, program: this.lockBase };
      return { isBass: true, event: bass };
    }
    return { isBass: false, event };
  }
}
