import { DatabaseConfig } from "../../types/database";

export enum TableUserSongs {
  FILES = "files",
  TRACKLIST = "tracklist",
}

export const USER_SONGS: DatabaseConfig = {
  name: "user-songs",
  version: 1,
  stores: [
    { name: TableUserSongs.FILES, keyPath: "id", autoIncrement: true },
    { name: TableUserSongs.TRACKLIST, keyPath: "id", autoIncrement: true },
  ],
};
