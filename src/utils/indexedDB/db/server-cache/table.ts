import { BaseTable } from "../../core/base";
import { SERVER_SONGS, TableServerSongs } from "./setup";
import { IFilesServerSongs, ITracklistServerSongs } from "./types";

export class FilesServerSongsManager extends BaseTable<IFilesServerSongs> {
  constructor() {
    super(SERVER_SONGS.name, TableServerSongs.FILES, SERVER_SONGS.stores[0]);
  }
}
export class TracklistServerSongsManager extends BaseTable<ITracklistServerSongs> {
  constructor() {
    super(
      SERVER_SONGS.name,
      TableServerSongs.TRACKLIST,
      SERVER_SONGS.stores[1]
    );
  }
}
