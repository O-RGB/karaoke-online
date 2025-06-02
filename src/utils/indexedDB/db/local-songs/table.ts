import { BaseTable } from "../../core/base";
import {
  IDirectoryLocalSongs,
  IFilesLocalSongs,
  ITracklistLocalSongs,
} from "./types";
import { TableLocalSongs } from "./setup";

export class DircetoryLocalSongsManager extends BaseTable<IDirectoryLocalSongs> {
  constructor() {
    super(TableLocalSongs.DIRECTORY);
  }
}

export class FilesLocalSongsManager extends BaseTable<IFilesLocalSongs> {
  constructor() {
    super(TableLocalSongs.FILES);
  }
}

export class TracklistLocalSongsManager extends BaseTable<ITracklistLocalSongs> {
  constructor() {
    super(TableLocalSongs.TRACKLIST);
  }
}
