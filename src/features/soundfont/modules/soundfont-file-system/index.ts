import { SoundSystemMode } from "@/features/config/types/config.type";
import { SoundfontBase } from "../../base";
import FileSystemManager from "@/utils/file/file-system";
import { BaseSynthEngine } from "@/features/engine/types/synth.type";
import { ISoundfontPlayer } from "@/utils/indexedDB/db/player/types";

export class SoundfontFileSystemManager extends SoundfontBase {
  private fileSystemManager: FileSystemManager | undefined = undefined;
  protected system: SoundSystemMode = "EXTREME_FILE_SYSTEM";
  constructor(engine: BaseSynthEngine) {
    super(engine);
  }

  setFileSystem(fileSystemManager: FileSystemManager) {
    this.fileSystemManager = fileSystemManager;
    console.log("Set File systme Manager");
  }

  getSoundfont(filename: string): Promise<File | undefined> {
    if (!this.fileSystemManager) {
      new Promise((resolve) => resolve(undefined));
      throw "File system Manager Is Null";
    }
    return this.fileSystemManager.getFileByPath(`SoundFont/${filename}`);
  }
  deleteSoundfont(id: string): boolean {
    throw new Error("Method not implemented.");
  }
  async soundfonts(): Promise<ISoundfontPlayer[]> {
    if (!this.fileSystemManager) {
      new Promise((resolve) => resolve(undefined));
      throw "File system Manager Is Null";
    }
    const files = await this.fileSystemManager?.listFiles("SoundFont");
    return files.map(
      (data, index) =>
        ({ createdAt: new Date(), file: data, id: index } as ISoundfontPlayer)
    );
  }
}
