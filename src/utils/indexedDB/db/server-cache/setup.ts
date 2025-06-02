import { DatabaseConfig } from "../../types/database";

export enum TableServerSongs {
  FILES = "files",
  TRACKLIST = "tracklist",
}

export const SERVER_SONGS: DatabaseConfig = {
  name: "server-cache",
  version: 1,
  stores: [
    { name: TableServerSongs.FILES, keyPath: "id", autoIncrement: true },
    { name: TableServerSongs.TRACKLIST, keyPath: "id", autoIncrement: true },
  ],
};
