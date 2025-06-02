import { BaseTable } from "../../core/base";
import { TableServerSongs } from "./setup";
import { IFilesServerSongs, ITracklistServerSongs } from "./types";

export class FilesServerSongsManager extends BaseTable<IFilesServerSongs> {
  constructor() {
    super(TableServerSongs.FILES);
  }
}
export class TracklistServerSongsManager extends BaseTable<ITracklistServerSongs> {
  constructor() {
    super(TableServerSongs.TRACKLIST);
  }
}
