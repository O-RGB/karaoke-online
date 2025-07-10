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

  async getSoundfont(id: string): Promise<File | undefined> {
    const response = await this.soundfontDatabase.get(Number(id));
    const file = response?.file;
    return file;
  }
  async deleteSoundfont(filename: string): Promise<boolean> {
    const fined = await this.soundfontDatabase.find(
      (item) => item.file.name === filename
    );

    if (fined.length === 1) {
      const item = fined[0];
      await this.soundfontDatabase.delete(item.id);
      return true;
    }

    return false;
  }
  async soundfonts(): Promise<ISoundfontPlayer[]> {
    return this.soundfontDatabase.getAll();
  }

  getSoundfontSelected(): string | undefined {
    return this.engine.soundfontName;
  }

  public async loadSoundfont(
    idOrFilename: string
  ): Promise<string | undefined> {
    const test = Number(idOrFilename);
    if (typeof test === "number") {
      const file = await this.soundfontDatabase.get(test);

      if (!file?.file) return;
      this.engine.setSoundFont(file.file, this.system);
      return file.file.name;
    }
  }
}
