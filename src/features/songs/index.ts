import FileSystemManager from "@/utils/file/file-system";
import { SoundSystemMode, SystemConfig } from "../config/types/config.type";
import { DBFSongsSystemReader } from "./modules/extreme/extreme-file-system";
import { BaseSongsSystemReader } from "./base/index-search";
import { ITrackData } from "./types/songs.type";
import { BaseUserSongsSystemReader } from "./base/tride-search";
import { PythonIndexReader } from "./modules/extreme/extreme-import";
import { ApiSongsSystemReader } from "./modules/extreme/extreme-api-system";
import { DircetoryLocalSongsManager } from "@/utils/indexedDB/db/local-songs/table";

type ReaderCreator = () =>
  | BaseSongsSystemReader
  | Promise<BaseSongsSystemReader>;

const readerCreators: Record<SoundSystemMode, ReaderCreator | null> = {
  EXTREME_FILE_SYSTEM: () => {
    return new DBFSongsSystemReader();
  },
  PYTHON_FILE_ENCODE: () => new PythonIndexReader(),
  PYTHON_API_SYSTEM: () => new ApiSongsSystemReader(),
  DATABASE_FILE_SYSTEM: null,
};

class ReaderFactory {
  public static create(
    mode: SoundSystemMode
  ): BaseSongsSystemReader | Promise<BaseSongsSystemReader> {
    const createReader = readerCreators[mode];
    if (!createReader) {
      throw new Error(`Unsupported or unknown sound system mode: ${mode}`);
    }
    return createReader();
  }
}

export class SongsSystem {
  public manager: BaseSongsSystemReader | undefined = undefined;
  public readonly userSong = new BaseUserSongsSystemReader();
  public currentMode: SoundSystemMode | undefined = undefined;

  private dircetoryLocalSongsManager: DircetoryLocalSongsManager | undefined =
    new DircetoryLocalSongsManager();
  private initializationPromise: Promise<void> | null = null;

  constructor(config?: Partial<SystemConfig>) {
    if (config?.soundMode) {
      this.init(config.soundMode).catch((error) => {
        console.error("Initialization failed in constructor:", error);
      });
    }
  }

  async reloadInit() {
    if (this.currentMode) {
      this.init(this.currentMode).catch((error) => {
        console.error("Initialization failed in constructor:", error);
      });
    }
  }

  async init(soundMode: SoundSystemMode, options?: any): Promise<void> {
    if (this.initializationPromise) {
      console.warn("System is already initializing, awaiting completion...");
      return this.initializationPromise;
    }

    if (soundMode === "DATABASE_FILE_SYSTEM") {
      console.log("Clearing main song system. User songs will remain active.");
      this.manager = undefined;
      this.currentMode = soundMode;
      return;
    }

    if (this.currentMode === soundMode && this.manager) {
      console.log(`Already initialized with ${soundMode} mode.`);
      return;
    }

    const initPromise = (async () => {
      this.currentMode = soundMode;
      this.manager = undefined;

      try {
        console.log(`Initializing ${soundMode} mode...`);

        const newManager = await ReaderFactory.create(soundMode);
        this.manager = newManager;

        if (soundMode === "EXTREME_FILE_SYSTEM") {
          const handle = await this.dircetoryLocalSongsManager?.get(1);
          if (handle?.handle) {
            this.manager.setFileSystem?.(FileSystemManager.getInstance());
          }
        }

        if (this.manager && typeof this.manager.loadIndex === "function") {
          await this.manager.loadIndex();
        }

        console.log(`Successfully initialized ${soundMode} mode.`);
      } catch (error) {
        console.error(`Failed to initialize ${soundMode} mode:`, error);

        this.manager = undefined;
        this.currentMode = undefined;

        throw error;
      }
    })();

    this.initializationPromise = initPromise;

    try {
      await this.initializationPromise;
    } finally {
      this.initializationPromise = null;
    }
  }

  public async switchMode(mode: SoundSystemMode, options?: any): Promise<void> {
    console.log(`Requesting to switch mode to: ${mode}`);
    await this.init(mode, options);
  }

  public getCurrentMode(): SoundSystemMode | undefined {
    return this.currentMode;
  }

  public getIsInitializing(): boolean {
    return this.initializationPromise !== null;
  }

  public isReady(): boolean {
    if (this.currentMode === "DATABASE_FILE_SYSTEM") {
      return !this.getIsInitializing();
    }
    return !this.getIsInitializing() && this.manager !== undefined;
  }

  public async reinitialize(options?: any): Promise<void> {
    const modeToReinit = this.currentMode;
    if (!modeToReinit) {
      throw new Error("Cannot reinitialize. No mode has been set.");
    }

    const previousMode = this.currentMode;
    this.currentMode = undefined;
    await this.init(previousMode ?? "DATABASE_FILE_SYSTEM", options);
  }

  public async onSearch(query: string): Promise<ITrackData[]> {
    const userSongsPromise = this.userSong.search(query);

    if (this.manager && this.isReady()) {
      const [userSongs, managerSongs] = await Promise.all([
        userSongsPromise,
        this.manager.search(query, {}),
      ]);
      return [...userSongs, ...managerSongs];
    }

    return userSongsPromise;
  }

  public async getSong(trackData: ITrackData): Promise<any | undefined> {
    if (!this.isReady()) {
      console.warn("System is not ready to get a song.");
      return undefined;
    }

    try {
      const userSong = await this.userSong.getSong(trackData);
      if (userSong) {
        return userSong;
      }
    } catch (error) {
      console.error(
        "Could not get song from user source. Trying main source...",
        error
      );
    }

    return this.manager?.getSong(trackData);
  }

  uninstall() {
    this.manager = undefined;
    this.dircetoryLocalSongsManager = undefined;
  }
}
