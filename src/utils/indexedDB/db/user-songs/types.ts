import { ITrackData } from "@/features/songs/types/songs.type";

export interface IFilesUserSongs {
  id: number;
  file: File;
  createdAt: Date;
}

export interface ITracklistUserSongs {
  id: number;
  data: ITrackData;
  createdAt: Date;
}
