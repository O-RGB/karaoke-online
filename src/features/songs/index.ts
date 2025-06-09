import FileSystemManager from "@/utils/file/file-system";
import { SoundSystemMode, SystemConfig } from "../config/types/config.type";
import { DBFSongsSystemReader } from "./modules/extreme/extreme-file-system";
import { BaseSongsSystemReader } from "./base";
import { JSONDBSongsSystemReader } from "./modules/json";
import { ITrackData } from "./types/songs.type";

export const dbfPath = "Data/SONG.DBF";

export class SongsSystem {
  public manager: BaseSongsSystemReader | undefined = undefined;
  private currentMode: SoundSystemMode | undefined = undefined;
  private isInitializing: boolean = false;

  constructor(config?: Partial<SystemConfig>) {
    // Auto-init เมื่อโปรแกรมเปิดใช้งาน
    if (config?.soundMode) {
      this.init(config.soundMode);
    }
  }

  async init(soundMode: SoundSystemMode, options?: any) {
    // ป้องกันการ init ซ้อนกัน
    if (this.isInitializing) {
      console.warn("System is already initializing...");
      return;
    }

    // ถ้าเป็น mode เดิมและมี manager แล้ว ไม่ต้อง init ใหม่
    if (this.currentMode === soundMode && this.manager) {
      console.log(`Already initialized with ${soundMode} mode`);
      return;
    }

    this.isInitializing = true;
    this.currentMode = soundMode;

    try {
      this.manager = undefined;

      switch (soundMode) {
        case "EXTREME_FILE_SYSTEM":
          await this.extremeFileSystem();
          break;
        case "LOAD_JSON_FILE":
          await this.jsonFileSystem(options?.jsonData);
          break;
        case "SERVER_API":
          await this.serverAPI(options);
          break;
        case "DRIVE_API":
          await this.driveAPI(options);
          break;
        default:
          throw new Error(`Unsupported sound system mode: ${soundMode}`);
      }

      console.log(`Successfully initialized ${soundMode} mode`);
    } catch (error) {
      console.error(`Failed to initialize ${soundMode} mode:`, error);
      this.manager = undefined;
      this.currentMode = undefined;
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  async extremeFileSystem() {
    const fsManager = FileSystemManager.getInstance();
    const hasRoot = await fsManager.hasSavedDirectory();

    if (!hasRoot) {
      const root = await fsManager.selectDirectory();
      const name = root.name;
    }

    this.manager = new DBFSongsSystemReader(fsManager, dbfPath);
    return await this.manager.loadIndex();
  }

  async jsonFileSystem(jsonData?: ITrackData[]) {
    if (jsonData) {
      this.manager = new JSONDBSongsSystemReader(jsonData);
      await this.manager.buildIndex();
    } else {
      this.manager = new JSONDBSongsSystemReader();
      await this.manager.loadIndex();
    }
  }

  async serverAPI(options?: { apiUrl?: string; token?: string }) {
    // TODO: Implement ServerAPISongsSystemReader
    console.log("Server API mode - options:", options);
    throw new Error("Server API mode not implemented yet");
  }

  async driveAPI(options?: { driveConfig?: any }) {
    // TODO: Implement DriveAPISongsSystemReader
    console.log("Drive API mode - options:", options);
    throw new Error("Drive API mode not implemented yet");
  }

  // Utility methods
  getCurrentMode(): SoundSystemMode | undefined {
    return this.currentMode;
  }

  getIsInitializing(): boolean {
    return this.isInitializing;
  }

  isReady(): boolean {
    return !this.isInitializing && this.manager !== undefined;
  }

  // สำหรับ reinit mode เดิม
  async reinitialize(options?: any) {
    if (!this.currentMode) {
      throw new Error("No current mode to reinitialize");
    }
    const mode = this.currentMode;
    this.currentMode = undefined; // Reset เพื่อให้ init ใหม่
    await this.init(mode, options);
  }
}
