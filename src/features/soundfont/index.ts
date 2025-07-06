import { DircetoryLocalSongsManager } from "@/utils/indexedDB/db/local-songs/table";
import { SoundSystemMode, SystemConfig } from "../config/types/config.type";
import { BaseSynthEngine } from "../engine/types/synth.type";
import { SoundfontBase } from "./base";
import { SoundfontFileSystemManager } from "./modules/soundfont-file-system";
import { SoundfontLocalSystemManager } from "./modules/soundfont-local-system";
import FileSystemManager from "@/utils/file/file-system";

export class SoundfontSystemManager {
  private manager: SoundfontBase | undefined = undefined;
  private local: SoundfontBase | undefined = undefined;
  private engine: BaseSynthEngine | undefined = undefined;
  public currentMode: SoundSystemMode | undefined = undefined;
  public selected?: string | undefined = undefined;
  public selectedFrom?: SoundSystemMode | undefined = undefined;
  private dircetoryLocalSongsManager = new DircetoryLocalSongsManager();

  constructor(engine: BaseSynthEngine, config?: Partial<SystemConfig>) {
    this.engine = engine;
    const soundMode = config?.soundMode;
    this.currentMode = soundMode;
    this.init(engine, soundMode ?? "DATABASE_FILE_SYSTEM");
  }

  async init(engine: BaseSynthEngine, config: SoundSystemMode) {
    this.manager = undefined;

    if (!this.local) {
      this.local = new SoundfontLocalSystemManager(engine);
    }

    switch (config) {
      case "EXTREME_FILE_SYSTEM":
        this.manager = new SoundfontFileSystemManager(engine);

        const handle = await this.dircetoryLocalSongsManager.get(1);
        if (handle?.handle) {
          this.manager.setFileSystem?.(FileSystemManager.getInstance());
        }
        if (this.selected) {
          this.manager?.loadSoundfont(this.selected);
        }

        break;

      default:
        break;
    }
  }

  public setMode(mode: SoundSystemMode) {
    if (this.currentMode === mode) {
      return;
    }
    console.log(`Changing sound system mode to: ${mode}`);
    this.currentMode = mode;

    if (!this.engine) return;
    this.init(this.engine, mode);
  }

  async getSoundfonts() {
    const sfm = await this.manager?.soundfonts();
    const sfl = await this.local?.soundfonts();
    return {
      manager: sfm ?? [],
      local: sfl ?? [],
    };
  }

  async removeSoundfont(id: string) {
    // ควรเรียกใช้ได้เฉพาะในโหมดที่รองรับ
    if (this.currentMode === "EXTREME_FILE_SYSTEM") {
      this.manager?.deleteSoundfont(id);
    } else {
      console.warn(
        "Cannot remove soundfont in the current mode:",
        this.currentMode
      );
    }
  }

  reset() {
    this.selected = undefined;
    this.selectedFrom = "DATABASE_FILE_SYSTEM";
  }

  setSoundfont(idOrFilename: string, form?: SoundSystemMode) {
    const targetMode = form ?? "DATABASE_FILE_SYSTEM";

    if (
      targetMode === "EXTREME_FILE_SYSTEM" &&
      this.currentMode === "EXTREME_FILE_SYSTEM"
    ) {
      this.manager?.loadSoundfont(idOrFilename);
    } else if (targetMode === "DATABASE_FILE_SYSTEM") {
      this.local?.loadSoundfont(idOrFilename);
    } else {
      console.error(
        `Cannot set soundfont from ${targetMode} while in ${this.currentMode} mode.`
      );
      return;
    }
    this.selected = idOrFilename;
    this.selectedFrom = targetMode;
  }
}
