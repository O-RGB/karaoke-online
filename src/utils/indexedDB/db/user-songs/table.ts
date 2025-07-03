import { BaseTable } from "../../core/base";
import { TableUserSongs, USER_SONGS } from "./setup";
import { IFilesUserSongs, ITracklistUserSongs } from "./types";

export class FilesUserSongsManager extends BaseTable<IFilesUserSongs> {
  constructor() {
    super(USER_SONGS.name, TableUserSongs.FILES, USER_SONGS.stores[0]);
  }
}
export class TracklistUserSongsManager extends BaseTable<ITracklistUserSongs> {
  constructor() {
    super(USER_SONGS.name, TableUserSongs.TRACKLIST, USER_SONGS.stores[1]);
  }
}
