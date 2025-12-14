import { SoundSystemMode } from "../../config/types/config.type";
import { BaseSynthEngine } from "../../engine/types/synth.type";
import { ISoundfontPlayer } from "@/utils/indexedDB/db/player/types";

export abstract class SoundfontBase {
  protected system: SoundSystemMode | undefined;
  protected engine: BaseSynthEngine;

  constructor(engine: BaseSynthEngine) {
    this.engine = engine;
  }

  abstract loadSoundfont(
    sf: ISoundfontPlayer
  ): Promise<ISoundfontPlayer | undefined>;
  abstract getSoundfont(sf: ISoundfontPlayer): Promise<File | undefined>;
  abstract deleteSoundfont(sf: ISoundfontPlayer): boolean | Promise<boolean>;
  abstract soundfonts(): Promise<ISoundfontPlayer[]>;
  abstract getSoundfontSelected(): string | undefined;
}
