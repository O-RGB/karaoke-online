export interface IDirectoryLocalSongs {
  id: number;
  handle: FileSystemDirectoryHandle;
}

export interface IFilesLocalSongs {
  id: number;
  file: File;
  createdAt: Date;
}

export interface ITracklistLocalSongs extends Omit<SearchResult, "id"> {
  id: number;
  songId: string;
  createdAt: Date;
}
