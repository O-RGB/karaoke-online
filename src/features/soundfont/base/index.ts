import { SoundSystemMode } from "../../config/types/config.type";
import { BaseSynthEngine } from "../../engine/types/synth.type";

export abstract class SoundfontBase {
  protected system: SoundSystemMode | undefined;
  protected engine: BaseSynthEngine;

  constructor(engine: BaseSynthEngine) {
    this.engine = engine;
  }
  public async loadSoundfont(idOrFilename: string) {
    const soundfont = await this.getSoundfont(idOrFilename);
    if (!soundfont) return;
    this.engine.setSoundFont(soundfont);
  }
  abstract getSoundfont(id: string): Promise<File | undefined>;
  abstract deleteSoundfont(id: string): boolean | Promise<boolean>;
  abstract soundfonts(): Promise<File[]>;
}
