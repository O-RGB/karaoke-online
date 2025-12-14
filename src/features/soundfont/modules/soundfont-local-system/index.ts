import { SoundSystemMode } from "@/features/config/types/config.type";
import { SoundfontBase } from "../../base";
import { BaseSynthEngine } from "@/features/engine/types/synth.type";
import { SoundfontPlayerManager } from "@/utils/indexedDB/db/player/table";
import { ISoundfontPlayer } from "@/utils/indexedDB/db/player/types";

export class SoundfontLocalSystemManager extends SoundfontBase {
  private soundfontDatabase: SoundfontPlayerManager;
  protected system: SoundSystemMode = "DATABASE_FILE_SYSTEM";
  constructor(engine: BaseSynthEngine) {
    super(engine);
    this.soundfontDatabase = new SoundfontPlayerManager();
  }

  async getSoundfont(sf: ISoundfontPlayer): Promise<File | undefined> {
    const response = await this.soundfontDatabase.get(sf.id);
    const file = response?.file;
    return file;
  }
  async deleteSoundfont(file: ISoundfontPlayer): Promise<boolean> {
    await this.soundfontDatabase.delete(file.id);
    return true;
  }
  async soundfonts(): Promise<ISoundfontPlayer[]> {
    const sfList = await this.soundfontDatabase.getAll();
    return sfList.map((x, i) => ({ ...x, keyId: `sf-local-system-${i}` }));
  }

  getSoundfontSelected(): string | undefined {
    return this.engine.soundfontName;
  }

  public async loadSoundfont(
    sf: ISoundfontPlayer
  ): Promise<ISoundfontPlayer | undefined> {
    const test = Number(sf.id);
    if (typeof test === "number") {
      const file = await this.soundfontDatabase.get(test);

      if (!file?.file) return;
      this.engine.setSoundFont(file.file, this.system);
      return {
        ...sf,
        file: file.file,
      };
    }
  }
}
