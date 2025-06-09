import { BaseTable } from "../../core/base";
import {
  IDirectoryLocalSongs,
  IFilesLocalSongs,
  IMasterIndexLocalSongs,
  ITracklistLocalSongs,
} from "./types";
import { LOCAL_SONGS, TableLocalSongs } from "./setup";

export class DircetoryLocalSongsManager extends BaseTable<IDirectoryLocalSongs> {
  constructor() {
    super(TableLocalSongs.DIRECTORY, LOCAL_SONGS.stores[0]);
  }
}

export class FilesLocalSongsManager extends BaseTable<IFilesLocalSongs> {
  constructor() {
    super(TableLocalSongs.FILES, LOCAL_SONGS.stores[1]);
  }
}

export class TracklistLocalSongsManager extends BaseTable<ITracklistLocalSongs> {
  constructor() {
    super(TableLocalSongs.CHUNKDATA, LOCAL_SONGS.stores[2]);
  }
}
export class MasterIndexLocalSongsManager extends BaseTable<IMasterIndexLocalSongs> {
  constructor() {
    super(TableLocalSongs.MASTER_INDEX, LOCAL_SONGS.stores[3]);
  }
}
