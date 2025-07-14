import { SoundSystemMode } from "../../config/types/config.type";
import { BaseSynthEngine } from "../../engine/types/synth.type";
import { ISoundfontPlayer } from "@/utils/indexedDB/db/player/types";

export abstract class SoundfontBase {
  protected system: SoundSystemMode | undefined;
  protected engine: BaseSynthEngine;

  constructor(engine: BaseSynthEngine) {
    this.engine = engine;
  }

  abstract loadSoundfont(idOrFilename: string): Promise<string | undefined>;
  abstract getSoundfont(id: string): Promise<File | undefined>;
  abstract deleteSoundfont(id: ISoundfontPlayer): boolean | Promise<boolean>;
  abstract soundfonts(): Promise<ISoundfontPlayer[]>;
  abstract getSoundfontSelected(): string | undefined;
}
