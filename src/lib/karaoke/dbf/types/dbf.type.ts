// Types and Interfaces
export interface DBFField {
  name: string;
  type: string;
  length: number;
}

export interface DBFHeader {
  recordCount: number;
  headerLength: number;
  recordLength: number;
  fields: DBFField[];
}

export interface DBFRecord {
  [key: string]: string | number | boolean | string[] | undefined;
  _originalIndex: number;
  _isNew?: boolean;
  _isModified?: boolean;
  _matchedTerms?: string[];
  _priority?: number;
}

export interface SearchResult {
  records: DBFRecord[];
  searchTime: number;
  totalFound: number;
  terminatedEarly?: boolean;
}

export interface SearchOptions {
  exactMatch?: boolean;
  searchAllFields?: boolean;
  maxResults?: number;
}

export interface ChunkData {
  chunkId: number;
  records: DBFRecord[];
  localWordIndex: Record<string, number[]>;
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

export type SoundType = "MIDI" | "VIDEO" | "MUSIC";
export type SoundSubType = "NCN" | "EMK";

export interface ISoundRecord {
  _originalIndex?: number;
  CODE: string;
  TYPE: SoundType;
  SUB_TYPE: SoundSubType;
  ALBUM: string;
  TITLE: string;
  KEY: string;
  TEMPO: number;
  LENGTH: number;
  ART_TYPE: string;
  ARTIST: string;
  AUTHOR: string;
  RHYTHM: string;
  CREATOR: string;
  COMPANY: string;
  LANGUAGE: string;
  YEAR: number;
  VOCAL_CHN: number;
  FILE_NAME: string;
  LYR_TITLE: string;
  START_TIME: number;
  STOP_TIME: number;
  AUDIO_VOL: number;
}
