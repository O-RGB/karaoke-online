import { SoundSystemMode } from "@/features/config/types/config.type";
import { SongInfo } from "@/lib/karaoke/songs/midi/types";
import {
  MusicFileType,
  MusicParsedData,
  MusicSubType,
} from "@/lib/karaoke/songs/types";

// [Database Index For Searcing]----------------

export interface ISearchRecordPreview {
  t: string;
  a: string;
  i: number;
  s: number;
}

export interface MasterIndex {
  totalRecords: number;
  words: string[];
  wordToChunkMap: Record<string, number>;
  buildTime: number;
  lastBuilt: string;
  initialToChunkMap: Record<string, number>;
}

export type PreviewChunk = Record<string, ISearchRecordPreview[]>;

// [Client Remote]----------------

export interface ITrackDataSelectBy {
  nickname: string;
  clientId: string;
}

// [Music Processing]----------------
export interface ITrackFlags {
  _originalIndex: number;
  _musicId?: string;
  _musicLike?: number;
  _musicUploader?: string;
  _musicPlayCount?: number;
  _superIndex?: number;
  _system: SoundSystemMode;
  _isNew?: boolean;
  _isModified?: boolean;
  _matchedTerms?: string[];
  _priority?: number;
  _selectBy?: ITrackDataSelectBy;
  _bufferFile?: MusicLoadAllData;
}

export interface ITrackData extends ITrackFlags, SongInfo {
  CODE: string;
  TYPE: MusicFileType;
  SUB_TYPE: MusicSubType;
}

export interface KaraokeExtension {
  emk?: File;
  midi?: File;
  lyr?: File;
  cur?: File;
  mp3?: File;
  mp4?: File;
  ykr?: File;
}

export interface MusicLoadAllData extends MusicParsedData {
  files: KaraokeExtension;
  selectBy?: string;
  fileType: string;
  trackData: ITrackData;
  isError?: boolean;
  isDuplicate?: boolean;
  isRemoteYoutube?: boolean;
}

// [Music Searcing]----------------
export interface SearchResult {
  records: ITrackData[];
  searchTime: number;
  totalFound: number;
  terminatedEarly?: boolean;
}

export interface SearchOptions {
  maxResults?: number;
}

// [Not use]----------------
export interface KaraokeDecoded extends KaraokeExtension {
  error?: boolean;
  isDuplicate?: boolean;
  fileName?: string;
  raw?: KaraokeExtension;
}

export interface TrackDataAndFile {
  records: ITrackData;
  raw: KaraokeExtension;
}
