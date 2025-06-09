import { ChunkData, MasterIndex } from "@/features/songs/types/songs.type";
import { ITrackData } from "@/features/songs/types/songs.type";

export interface IDirectoryLocalSongs {
  id: number;
  handle: FileSystemDirectoryHandle;
}

export interface IFilesLocalSongs {
  id: number;
  file: File;
  createdAt: Date;
}

export interface ITracklistLocalSongs {
  id: number;
  data: ChunkData;
  createdAt: Date;
}
export interface IMasterIndexLocalSongs {
  id: number;
  data: MasterIndex;
  createdAt: Date;
}
