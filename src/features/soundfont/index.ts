import { DEFAULT_SOUND_FONT } from "@/config/value";
import { SoundSystemMode } from "../config/types/config.type";
import { BaseSynthEngine } from "../engine/types/synth.type";
import { SoundfontBase } from "./base";
import { SoundfontFileSystemManager } from "./modules/soundfont-file-system";
import { SoundfontLocalSystemManager } from "./modules/soundfont-local-system";

export class SoundfontSystemManager {
  private manager: SoundfontBase | undefined = undefined;
  private local: SoundfontBase | undefined = undefined;
  private engine: BaseSynthEngine | undefined = undefined;
  public currentMode: SoundSystemMode | undefined = undefined;
  public selected?: string | undefined = undefined;
  public selectedFrom?: SoundSystemMode | undefined = undefined;

  constructor(engine: BaseSynthEngine, config?: SoundSystemMode) {
    this.engine = engine;
    const soundMode = config;
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
    this.engine?.loadDefaultSoundFont();
    return DEFAULT_SOUND_FONT;
  }

  async setSoundfont(idOrFilename: string, form?: SoundSystemMode) {
    const targetMode = form ?? "DATABASE_FILE_SYSTEM";

    let selected: string | undefined = undefined;
    if (
      targetMode === "EXTREME_FILE_SYSTEM" &&
      this.currentMode === "EXTREME_FILE_SYSTEM"
    ) {
      selected = await this.manager?.loadSoundfont(idOrFilename);
    } else if (
      targetMode === "DATABASE_FILE_SYSTEM" ||
      "PYTHON_FILE_ENCODE" ||
      "PYTHON_API_SYSTEM"
    ) {
      selected = await this.local?.loadSoundfont(idOrFilename);
    } else {
      console.error(
        `Cannot set soundfont from ${targetMode} while in ${this.currentMode} mode.`
      );
      return;
    }

    this.selected = selected;
    this.selectedFrom = targetMode;

    return selected;
  }

  public loadDefaultSoundfont = () => {
    this.engine?.loadDefaultSoundFont();
    return DEFAULT_SOUND_FONT;
  };

  uninstall() {
    this.local = undefined;
    this.engine = undefined;
  }
}
