export type SoundType = "MIDI" | "VIDEO" | "MUSIC";
export type SoundSubType = "NCN" | "EMK";

export interface ITrackFlags {
  _originalIndex: number;
  _isNew?: boolean;
  _isModified?: boolean;
  _matchedTerms?: string[];
  _priority?: number;
}

export interface ITrackData extends ITrackFlags {
  CODE: string;
  TITLE: string;
  TYPE: SoundType;
  ARTIST: string;
  FILE_NAME?: string;
  SUB_TYPE?: SoundSubType;
  ALBUM?: string;
  KEY?: string;
  TEMPO?: number;
  LENGTH?: number;
  ART_TYPE?: string;
  AUTHOR?: string;
  RHYTHM?: string;
  CREATOR?: string;
  COMPANY?: string;
  LANGUAGE?: string;
  YEAR?: number;
  VOCAL_CHN?: number;
  LYR_TITLE?: string;
  START_TIME?: number;
  STOP_TIME?: number;
  AUDIO_VOL?: number;
}

export interface MasterIndex {
  totalRecords: number;
  totalChunks: number;
  chunkSize: number;
  wordToChunks: Record<string, number[]>;
  fields: string[];
  buildTime: number;
  lastBuilt: string;
}

export interface ChunkData {
  chunkId: number;
  records: ITrackData[];
  localWordIndex: Record<string, number[]>;
}

export interface SearchResult {
  records: ITrackData[];
  searchTime: number;
  totalFound: number;
  terminatedEarly?: boolean;
}

export interface SearchOptions {
  exactMatch?: boolean;
  searchAllFields?: boolean;
  maxResults?: number;
}

export interface KaraokeExtension {
  midi: File;
  lyr: File;
  cur: File;
}
