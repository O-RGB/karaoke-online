import { SoundSystemMode, SystemConfig } from "../config/types/config.type";
import { BaseSynthEngine } from "../engine/types/synth.type";
import { SoundfontBase } from "./base";
import { SoundfontFileSystemManager } from "./modules/soundfont-file-system";
import { SoundfontLocalSystemManager } from "./modules/soundfont-local-system";

export class SoundfontSystemManager {
  private manager: SoundfontBase | undefined = undefined;
  private local: SoundfontBase | undefined = undefined;
  private engine: BaseSynthEngine;
  public currentMode: SoundSystemMode | undefined = undefined;
  public selected?: string | undefined = undefined;
  public selectedFrom?: SoundSystemMode | undefined = undefined;

  constructor(engine: BaseSynthEngine, config?: Partial<SystemConfig>) {
    this.engine = engine;
    const soundMode = config?.soundMode;
    this.currentMode = soundMode;
    this.init();
  }

  init() {
    this.local = new SoundfontLocalSystemManager(this.engine);
    switch (this.currentMode) {
      case "EXTREME_FILE_SYSTEM":
        this.manager = new SoundfontFileSystemManager(this.engine);
        if (this.selected) {
          this.manager?.loadSoundfont(this.selected);
        }
        break;

      default:
        break;
    }
  }

  async getSoundfonts() {
    const sfm = await this.manager?.soundfonts();
    const sfl = await this.local?.soundfonts();
    return {
      manager: sfm ?? [],
      local: sfl ?? [],
    };
  }

  setSoundfont(idOrFilename: string, form?: SoundSystemMode) {
    if (form === "EXTREME_FILE_SYSTEM") {
      this.manager?.loadSoundfont(idOrFilename);
    } else if (form === undefined) {
      this.local?.loadSoundfont(idOrFilename);
    }
    this.selected = idOrFilename;
    this.selectedFrom = form;
  }
}
