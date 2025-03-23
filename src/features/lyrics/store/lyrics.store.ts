import { create } from "zustand";
import { ISentence } from "@/features/lyrics/types/lyrics-player.type";
import { LyricsRangeArray } from "@/features/lyrics/lib/lyrics-range-array";

interface LyricsStore {
  lyricsProcessed: LyricsRangeArray<ISentence> | undefined;
  cursors: number[];
  lyricsInit: (lyrics: string[], cursors: number[]) => void;
}

const useLyricsStoreNew = create<LyricsStore>((set, get) => ({
  lyricsProcessed: undefined,
  cursors: [],

  lyricsInit: (lyrics, cursors) => {
    let lyricsCut = lyrics.slice(3);
    const processed = processedLyrics(lyricsCut, cursors);

    set({
      lyricsProcessed: processed,
      cursors,
    });
  },
}));

export default useLyricsStoreNew;

const processedLyrics = (
  lyrics: string[],
  cursors: number[]
): LyricsRangeArray<ISentence> | undefined => {
  if (!lyrics.length || !cursors.length) return undefined;
  let arrayRange = new LyricsRangeArray<ISentence>();
  let cursorIndex = 0;
  lyrics
    .map((line) => {
      const lineLength = line.length;
      if (lineLength === 0) return;
      const lineCursor = cursors.slice(
        cursorIndex,
        cursorIndex + lineLength + 1
      );
      cursorIndex += lineLength + 1;
      if (!lineCursor.length) return;
      const [start, ...valueName] = lineCursor;
      const end = valueName[lineLength - 1] || start;

      const value = { text: line, start, valueName, end };
      arrayRange.push([start, end], value);
      return value;
    })
    .filter((x) => x !== undefined);

  return arrayRange;
};
