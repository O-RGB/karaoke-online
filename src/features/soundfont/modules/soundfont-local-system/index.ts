import { SoundSystemMode } from "@/features/config/types/config.type";
import { SoundfontBase } from "../../base";
import FileSystemManager from "@/utils/file/file-system";
import { BaseSynthEngine } from "@/features/engine/types/synth.type";
import { SoundfontPlayerManager } from "@/utils/indexedDB/db/player/table";

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
  async soundfonts(): Promise<File[]> {
    const response = await this.soundfontDatabase.getAll();
    return response.map((data) => data.file);
  }
}
