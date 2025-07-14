import { SoundSystemMode } from "@/features/config/types/config.type";
import { SoundfontBase } from "../../base";
import FileSystemManager from "@/utils/file/file-system";
import { BaseSynthEngine } from "@/features/engine/types/synth.type";
import { ISoundfontPlayer } from "@/utils/indexedDB/db/player/types";

export class SoundfontFileSystemManager extends SoundfontBase {
  deleteSoundfont(id: ISoundfontPlayer): boolean | Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  private fileSystemManager: FileSystemManager | undefined = undefined;
  protected system: SoundSystemMode = "EXTREME_FILE_SYSTEM";
  constructor(engine: BaseSynthEngine) {
    super(engine);
    this.fileSystemManager = FileSystemManager.getInstance();
  }

  getSoundfont(filename: string): Promise<File | undefined> {
    if (!this.fileSystemManager) {
      new Promise((resolve) => resolve(undefined));
      throw "File system Manager Is Null";
    }
    return this.fileSystemManager.getFileByPath(`SoundFont/${filename}`);
  }

  async soundfonts(): Promise<ISoundfontPlayer[]> {
    if (!this.fileSystemManager) {
      new Promise((resolve) => resolve(undefined));
      console.log("File system Manager Is Null");
      throw "File system Manager Is Null";
    }
    const files = await this.fileSystemManager?.listFiles("SoundFont/");
    return files.map(
      (data, index) =>
        ({ createdAt: new Date(), file: data, id: index } as ISoundfontPlayer)
    );
  }

  getSoundfontSelected(): string | undefined {
    return this.engine.soundfontName;
  }

  public async loadSoundfont(
    idOrFilename: string
  ): Promise<string | undefined> {
    if (!this.fileSystemManager) {
      new Promise((resolve) => resolve(undefined));
      console.log("File system Manager Is Null");
      throw "File system Manager Is Null";
    }
    const file = await this.fileSystemManager.getFileByPath(
      `SoundFont/${idOrFilename}`
    );

    if (!file) return;
    this.engine.setSoundFont(file, this.system);
    return file.name;
  }
}
