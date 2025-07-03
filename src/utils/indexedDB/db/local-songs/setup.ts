import { DatabaseConfig } from "../../types/database";

export enum TableLocalSongs {
  DIRECTORY = "directory",
  FILES = "files",
  CHUNKDATA = "chunk-data",
  MASTER_INDEX = "master-index",
}

export const LOCAL_SONGS: DatabaseConfig = {
  name: "local-songs",
  version: 1,
  stores: [
    { name: TableLocalSongs.DIRECTORY },
    { name: TableLocalSongs.FILES },
    { name: TableLocalSongs.CHUNKDATA },
    { name: TableLocalSongs.MASTER_INDEX },
  ],
};
