import { ISentence } from "../lyrics/types";
import { TempoEvent } from "./midi/types";
import { ParsedSongData } from "./shared/types";
import { ArrayRange } from "./utils/arrayrange";

export type MusicMode = "mp3" | "midi" | "mp4" | "youtube";
export type MusicFileType = "emk" | "ncn" | "mp3";
export type MusicSubType = MusicFileType | "mid" | "mp4" | "youtube";

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
}
