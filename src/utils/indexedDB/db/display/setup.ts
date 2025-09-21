import { DatabaseConfig } from "../../types/database";

export enum TableDisplaySongs {
  FONT = "font",
  WALLPAPER = "wallpaper",
  RECORDINGS = "recordings",
}

export const DISPLAY: DatabaseConfig = {
  name: "display",
  version: 2,
  stores: [
    { name: TableDisplaySongs.FONT, keyPath: "id", autoIncrement: true },
    { name: TableDisplaySongs.WALLPAPER, keyPath: "id", autoIncrement: true },
    { name: TableDisplaySongs.RECORDINGS, keyPath: "id", autoIncrement: true },
  ],
};
