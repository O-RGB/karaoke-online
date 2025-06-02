import { DatabaseConfig } from "../../types/database";

export enum TableDisplaySongs {
  FONT = "font",
  WALLPAPER = "wallpaper",
}

export const DISPLAY: DatabaseConfig = {
  name: "display",
  version: 1,
  stores: [
    { name: TableDisplaySongs.FONT, keyPath: "id", autoIncrement: true },
    { name: TableDisplaySongs.WALLPAPER, keyPath: "id", autoIncrement: true },
  ],
};
