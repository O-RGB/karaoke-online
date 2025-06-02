export enum TableLocalSongs {
  FILES = "files",
  TRACKLIST = "tracklist",
}

export interface IFilesServerSongs {
  id: number;
  file: File;
  createdAt: Date;
}

export interface ITracklistServerSongs extends Omit<SearchResult, "id"> {
  id: number;
  songId: string;
  createdAt: Date;
}
