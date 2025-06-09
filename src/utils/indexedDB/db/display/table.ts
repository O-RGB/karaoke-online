import { BaseTable } from "../../core/base";
import { DISPLAY, TableDisplaySongs } from "./setup";
import { IFontDisplay, IWallpaperDisplay } from "./types";

export class FontDisplayManager extends BaseTable<IFontDisplay> {
  constructor() {
    super(TableDisplaySongs.FONT, DISPLAY.stores[0]);
  }
}

export class WallpaperDisplayManager extends BaseTable<IWallpaperDisplay> {
  constructor() {
    super(TableDisplaySongs.WALLPAPER, DISPLAY.stores[1]);
  }
}
