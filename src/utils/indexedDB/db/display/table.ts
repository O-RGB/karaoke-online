import { BaseTable } from "../../core/base";
import { TableDisplaySongs } from "./setup";
import { IFontDisplay, IWallpaperDisplay } from "./types";

export class FontDisplayManager extends BaseTable<IFontDisplay> {
  constructor() {
    super(TableDisplaySongs.FONT);
  }
}

export class WallpaperDisplayManager extends BaseTable<IWallpaperDisplay> {
  constructor() {
    super(TableDisplaySongs.WALLPAPER);
  }
}
