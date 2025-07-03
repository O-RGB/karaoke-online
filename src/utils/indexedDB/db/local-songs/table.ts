import { BaseTable } from "../../core/base";
import {
  IDirectoryLocalSongs,
  IFilesLocalSongs,
  IMasterIndexLocalSongs,
  IChunkDataLocalSongs as IChunkDataLocalSongs,
} from "./types";
import { LOCAL_SONGS, TableLocalSongs } from "./setup";

export class DircetoryLocalSongsManager extends BaseTable<IDirectoryLocalSongs> {
  constructor() {
    super(LOCAL_SONGS.name, TableLocalSongs.DIRECTORY, LOCAL_SONGS.stores[0]);
  }
}

export class FilesLocalSongsManager extends BaseTable<IFilesLocalSongs> {
  constructor() {
    super(LOCAL_SONGS.name, TableLocalSongs.FILES, LOCAL_SONGS.stores[1]);
  }
}

export class ChunkDataLocalSongsManager extends BaseTable<IChunkDataLocalSongs> {
  constructor() {
    super(LOCAL_SONGS.name, TableLocalSongs.CHUNKDATA, LOCAL_SONGS.stores[2]);
  }
}
export class MasterIndexLocalSongsManager extends BaseTable<IMasterIndexLocalSongs> {
  constructor() {
    super(
      LOCAL_SONGS.name,
      TableLocalSongs.MASTER_INDEX,
      LOCAL_SONGS.stores[3]
    );
  }
}
