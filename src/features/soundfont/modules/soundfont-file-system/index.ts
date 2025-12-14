import { SoundSystemMode } from "@/features/config/types/config.type";
import { SoundfontBase } from "../../base";
import FileSystemManager from "@/utils/file/file-system";
import { BaseSynthEngine } from "@/features/engine/types/synth.type";
import { ISoundfontPlayer } from "@/utils/indexedDB/db/player/types";

export class SoundfontFileSystemManager extends SoundfontBase {
  deleteSoundfont(sf: ISoundfontPlayer): boolean | Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  private fileSystemManager: FileSystemManager | undefined = undefined;
  protected system: SoundSystemMode = "EXTREME_FILE_SYSTEM";
  constructor(engine: BaseSynthEngine) {
    super(engine);
    this.fileSystemManager = FileSystemManager.getInstance();
  }

  getSoundfont(sf: ISoundfontPlayer): Promise<File | undefined> {
    if (!this.fileSystemManager) {
      new Promise((resolve) => resolve(undefined));
      throw "File system Manager Is Null";
    }
    return this.fileSystemManager.getFileByPath(`SoundFont/${sf.file.name}`);
  }

  async soundfonts(): Promise<ISoundfontPlayer[]> {
    if (!this.fileSystemManager) {
      new Promise((resolve) => resolve(undefined));
      console.log("File system Manager Is Null");
      throw "File system Manager Is Null";
    }
    const files = await this.fileSystemManager?.listFiles("SoundFont/");
    const maping = files.map(
      (data, index) =>
        ({
          createdAt: new Date(),
          file: data,
          id: index,
          keyId: `sf-file-system-${index}`,
        } as ISoundfontPlayer)
    );
    return maping;
  }

  getSoundfontSelected(): string | undefined {
    return this.engine.soundfontName;
  }

  public async loadSoundfont(
    sf: ISoundfontPlayer
  ): Promise<ISoundfontPlayer | undefined> {
    if (!this.fileSystemManager) {
      new Promise((resolve) => resolve(undefined));
      console.log("File system Manager Is Null");
      throw "File system Manager Is Null";
    }

    const file = await this.fileSystemManager.getFileByPath(
      `SoundFont/${sf.file.name}`
    );

    if (!file) return;
    this.engine.setSoundFont(file, this.system);
    return {
      ...sf,
      file,
    };
  }
}
