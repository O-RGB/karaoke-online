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

export interface ISearchRecordPreview {
  t: string;
  a: string;
  i: number;
}

export interface MasterIndex {
  totalRecords: number;
  words: string[];
  wordToChunkMap: Record<string, number>;
  buildTime: number;
  lastBuilt: string;
}

export type PreviewChunk = Record<string, ISearchRecordPreview[]>;

export interface SearchResult {
  records: ITrackData[];
  searchTime: number;
  totalFound: number;
  terminatedEarly?: boolean;
}

export interface SearchOptions {
  maxResults?: number;
}

export interface KaraokeExtension {
  midi: File;
  lyr: File | string[];
  cur: File | number[];
}
export interface KaraokeCompress {
  emk: File;
}

export interface KaraokeDecoded
  extends Partial<KaraokeExtension>,
    Partial<KaraokeCompress> {
  error?: boolean;
  fileName?: string;
}
