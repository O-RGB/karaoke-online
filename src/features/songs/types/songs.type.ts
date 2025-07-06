import { SoundSystemMode } from "@/features/config/types/config.type";

export type SoundType = "MIDI" | "VIDEO" | "MUSIC";
export type SoundSubType = "NCN" | "EMK";

export interface ITrackFlags {
  _originalIndex: number;
  _superIndex?: number;
  _system: SoundSystemMode;
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

export interface SearchResult {
  records: ITrackData[];
  searchTime: number;
  totalFound: number;
  terminatedEarly?: boolean;
}

export interface SearchOptions {
  maxResults?: number;
}

type LyrData = string[];
type CurData = number[];

export interface KaraokeExtension<T = any> {
  emk?: File;
  midi: File;
  lyr: T extends File ? File : LyrData;
  cur: T extends File ? File : CurData;
}

export interface KaraokeDecoded extends KaraokeExtension<string> {
  error?: boolean;
  isDuplicate?: boolean;
  fileName?: string;
  raw?: KaraokeExtension<File>;
}

export interface TrackDataAndFile {
  records: ITrackData;
  raw: KaraokeExtension<File>;
}
