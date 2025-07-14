import { DatabaseConfig } from "../../types/database";

export enum TablePlayerSongs {
  SOUND_FONT = "soundfont",
  SOUND_FONT_CHUNK = "soundfont_chunk",
}

export const PLAYER: DatabaseConfig = {
  name: "player",
  version: 1,
  stores: [
    { name: TablePlayerSongs.SOUND_FONT, keyPath: "id", autoIncrement: true },
    {
      name: TablePlayerSongs.SOUND_FONT_CHUNK,
      keyPath: "id",
      autoIncrement: true,
    },
  ],
};
