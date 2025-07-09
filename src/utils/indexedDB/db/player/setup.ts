import { DatabaseConfig } from "../../types/database";

export enum TablePlayerSongs {
  SOUND_FONT = "soundfont",
}

export const PLAYER: DatabaseConfig = {
  name: "player",
  version: 1,
  stores: [
    { name: TablePlayerSongs.SOUND_FONT, keyPath: "id", autoIncrement: true },
  ],
};
