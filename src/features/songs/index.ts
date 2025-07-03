import FileSystemManager from "@/utils/file/file-system";
import { SoundSystemMode, SystemConfig } from "../config/types/config.type";
import { DBFSongsSystemReader } from "./modules/extreme/extreme-file-system";
import { BaseSongsSystemReader } from "./base/index-search";
import { ITrackData, KaraokeExtension } from "./types/songs.type";
import { BaseUserSongsSystemReader } from "./base/tride-search";
import { PythonIndexReader } from "./modules/extreme/extreme-import";

export const dbfPath = "Data/SONG.DBF";

export class SongsSystem {
  public manager: BaseSongsSystemReader | undefined = undefined;
  public userSong = new BaseUserSongsSystemReader();
  private currentMode: SoundSystemMode | undefined = undefined;
  private isInitializing: boolean = false;

  constructor(config?: Partial<SystemConfig>) {
    if (config?.soundMode) {
      this.init(config.soundMode);
    }
  }

  async init(soundMode: SoundSystemMode, options?: any) {
    console.log(this.userSong);
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
        case "PYTHON_FILE_ENCODE":
          await this.pythonSystem();
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

      console.log(`Successfully initialized ${soundMode} mode`, this.userSong);
    } catch (error) {
      console.error(
        `Failed to initialize ${soundMode} mode:`,
        error,
        this.userSong
      );
      this.manager = undefined;
      this.currentMode = undefined;
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  async extremeFileSystem() {
    const fsManager = FileSystemManager.getInstance();
    const hasRoot = await fsManager.getRootHandle();
    // console.log("hasRoot", hasRoot);
    // if (!hasRoot) {
    //   const root = await fsManager.selectDirectory();
    //   const name = root.name;
    // }

    if (fsManager) {
      this.manager = new DBFSongsSystemReader(fsManager, dbfPath);
      return await this.manager.loadIndex();
    }
  }

  async pythonSystem() {
    this.manager = new PythonIndexReader();
    this.manager.loadIndex();
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

  async reinitialize(options?: any) {
    if (!this.currentMode) {
      throw new Error("No current mode to reinitialize");
    }
    const mode = this.currentMode;
    this.currentMode = undefined;
    await this.init(mode, options);
  }

  async onSearch(query: string) {
    const managerSong = (await this.manager?.search(query)) ?? [];
    const userSong = this.userSong.search(query);
    return [...userSong, ...managerSong];
  }

  async getSong(trackData: ITrackData) {
    console.log("on get song song system ", trackData);
    if (trackData._superIndex !== undefined) {
      return this.manager?.getSong(trackData);
      try {
        return this.userSong.getSong(trackData);
      } catch (error) {
      }
    } else {
      return this.manager?.getSong(trackData);
    }
  }
}
