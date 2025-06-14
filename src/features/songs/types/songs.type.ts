// src/features/songs/types/songs.types.ts

// === Core Data Types ===
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

// === V6 Optimized Index Types ===

/**
 * Interface สำหรับข้อมูลแสดงผลฉบับย่อที่จะถูกเก็บใน Preview Chunk
 */
export interface ISearchRecordPreview {
  t: string; // Title
  a: string; // Artist
  i: number; // _originalIndex
}

/**
 * MasterIndex V6 จะเก็บ Sorted Array และ Word-to-Chunk Map
 */
export interface MasterIndex {
  totalRecords: number;
  words: string[]; // Sorted array ของคำทั้งหมด
  wordToChunkMap: Record<string, number>; // บอกว่าคำนี้อยู่ preview chunk ไหน
  buildTime: number;
  lastBuilt: string;
}

/**
 * Preview Chunk เป็นแค่ Object ธรรมดาที่ map คำไปยังข้อมูล Preview
 */
export type PreviewChunk = Record<string, ISearchRecordPreview[]>;

// === Utility & Result Types ===

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
  lyr: File;
  cur: File;
}
