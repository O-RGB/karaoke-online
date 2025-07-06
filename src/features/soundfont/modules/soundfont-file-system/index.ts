import { SoundSystemMode } from "@/features/config/types/config.type";
import { SoundfontBase } from "../../base";
import FileSystemManager from "@/utils/file/file-system";
import { BaseSynthEngine } from "@/features/engine/types/synth.type";

export class SoundfontFileSystemManager extends SoundfontBase {
  private fileSystemManager: FileSystemManager;
  protected system: SoundSystemMode = "EXTREME_FILE_SYSTEM";
  constructor(engine: BaseSynthEngine) {
    super(engine);
    this.fileSystemManager = FileSystemManager.getInstance();
  }

  getSoundfont(filename: string): Promise<File | undefined> {
    return this.fileSystemManager.getFileByPath(`SoundFont/${filename}`);
  }
  deleteSoundfont(id: string): boolean {
    throw new Error("Method not implemented.");
  }
  soundfonts(): Promise<File[]> {
    return this.fileSystemManager.listFiles("SoundFont");
  }
}
