import { ISentence } from "../lyrics/types";
import { TempoEvent } from "./midi/types";
import { ParsedSongData } from "./shared/types";
import { ArrayRange } from "./utils/arrayrange";

export type MusicMode = "MP3" | "MIDI" | "MP4" | "YOUTUBE";
export type MusicFileType = "EMK" | "NCN" | "MP3";
export type MusicSubType = MusicFileType | "MID" | "mp4" | "YOUTUBE";

export interface LyricWordData {
  name: string;
  start: number | null;
  end: number | null;
  length: number;
  index: number;
  lineIndex: number;
}

export interface MusicParsedData {
  baseName: string;
  metadata?: ParsedSongData;
  lyricsRange?: ArrayRange<ISentence>;
  tempoRange?: ArrayRange<TempoEvent>;
  musicType: MusicMode;
  duration: number;
}
