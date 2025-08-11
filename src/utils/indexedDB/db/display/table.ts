import { BaseTable } from "../../core/base";
import { DISPLAY, TableDisplaySongs } from "./setup";
import { IFontDisplay, IRecordingsDisplay, IWallpaperDisplay } from "./types";

export class FontDisplayManager extends BaseTable<IFontDisplay> {
  constructor() {
    super(DISPLAY.name, TableDisplaySongs.FONT, DISPLAY.stores[0]);
  }
}

export class WallpaperDisplayManager extends BaseTable<IWallpaperDisplay> {
  constructor() {
    super(DISPLAY.name, TableDisplaySongs.WALLPAPER, DISPLAY.stores[1]);
  }
}

export class RecordingsManager extends BaseTable<IRecordingsDisplay> {
  constructor() {
    super(DISPLAY.name, TableDisplaySongs.RECORDINGS, DISPLAY.stores[2]);
  }
}
