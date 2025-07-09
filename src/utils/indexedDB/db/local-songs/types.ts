import { MasterIndex, PreviewChunk } from "@/features/songs/types/songs.type";


export interface IDirectoryLocalSongs {
  id: number;
  handle: FileSystemDirectoryHandle;
  createdAt: Date;
}

export interface IFilesLocalSongs {
  id: number;
  file: File;
  createdAt: Date;
}

export interface IChunkDataLocalSongs {
  id: number;
  data: PreviewChunk;
  createdAt: Date;
}
export interface IMasterIndexLocalSongs {
  id: number;
  data: MasterIndex;
  createdAt: Date;
}
