import { DatabaseConfig } from "../../types/database";

export enum TableDisplaySongs {
  FONT = "font",
  WALLPAPER = "wallpaper",
  RECORDINGS = "recordings", // เพิ่ม Store ใหม่
}

export const DISPLAY: DatabaseConfig = {
  name: "display",
  version: 2, // เพิ่มเวอร์ชันเป็น 2
  stores: [
    { name: TableDisplaySongs.FONT, keyPath: "id", autoIncrement: true },
    { name: TableDisplaySongs.WALLPAPER, keyPath: "id", autoIncrement: true },
    // เพิ่มการตั้งค่าสำหรับ Store ใหม่
    { name: TableDisplaySongs.RECORDINGS, keyPath: "id", autoIncrement: true },
  ],
};
