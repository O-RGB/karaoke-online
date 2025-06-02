import { DatabaseConfig } from "../../types/database";

export enum TableLocalSongs {
  DIRECTORY = "directory",
  FILES = "files",
  TRACKLIST = "tracklist",
}

export const LOCAL_SONGS: DatabaseConfig = {
  name: "local-songs",
  version: 1,
  stores: [
    { name: TableLocalSongs.DIRECTORY, keyPath: "id", autoIncrement: true },
    { name: TableLocalSongs.FILES, keyPath: "id", autoIncrement: true },
    { name: TableLocalSongs.TRACKLIST, keyPath: "id", autoIncrement: true },
  ],
};
