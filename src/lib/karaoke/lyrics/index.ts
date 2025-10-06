import {
  cursorToTick,
  TickLyricSegmentGenerator,
  TimestampLyricSegmentGenerator,
} from "../cursors";
import {
  DEFAULT_PRE_ROLL_OFFSET_MIDI,
  DEFAULT_PRE_ROLL_OFFSET_MP3,
  DEFAULT_CHORD_DURATION,
} from "../songs/config";
import { TempoEvent } from "../songs/midi/types";
import { ParsedSongData } from "../songs/shared/types";
import { LyricWordData, MusicMode } from "../songs/types";
import { ArrayRange } from "../songs/utils/arrayrange";
import { ISentence } from "./types";
import { groupWordDataToEvents } from "./xml-event/convert";

export const curToArrayRange = (
  lyrics: string[],
  cursors: number[]
): ArrayRange<ISentence> | undefined => {
  if (!lyrics.length || !cursors.length) return undefined;
  let arrayRange = new ArrayRange<ISentence>();
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

export const convertLyricsMapping = (
  data: ParsedSongData,
  mode: MusicMode,
  songPpq: number,
  tempos?: ArrayRange<TempoEvent>
) => {
  const isMidi = mode === "MIDI";
  if (!data.lyrics || data.lyrics.length === 0) {
    return {
      finalWords: [],
      convertedChords:
        data.chords
          ?.map((chord) => ({
            ...chord,
            tick: isMidi ? chord.tick : chord.tick / 1000,
          }))
          .sort((a, b) => a.tick - b.tick) || [],
    };
  }

  const finalWords: LyricWordData[] = [];
  let globalWordIndex = 0;

  const flatLyrics = data.lyrics.flat().sort((a, b) => a.tick - b.tick);

  // isMidi มีการ Build ออกมาแล้วคลาดเคลื่อนนิดหน่อยต้อง - จาก 0.4 ด้วย 0.35
  data.lyrics.forEach((line, lineIndex: number) => {
    line.forEach((wordEvent) => {
      const bpm = isMidi ? tempos!.search(wordEvent.tick)?.lyrics.value.bpm : 0;

      const offsetTicks = isMidi
        ? (DEFAULT_PRE_ROLL_OFFSET_MIDI * songPpq * bpm!) / 60
        : DEFAULT_PRE_ROLL_OFFSET_MP3;

      const baseTick = isMidi
        ? cursorToTick(wordEvent.tick, songPpq)
        : wordEvent.tick / 1000;

      const convertedTick = Math.max(0, baseTick - offsetTicks);

      const currentFlatIndex = flatLyrics.findIndex(
        (e) => e.tick === wordEvent.tick && e.text === wordEvent.text
      );
      const nextEvent = flatLyrics[currentFlatIndex + 1];

      let endTime: number;
      if (nextEvent) {
        const nextBaseTick = isMidi
          ? cursorToTick(nextEvent.tick, songPpq)
          : nextEvent.tick / 1000;
        endTime = Math.max(0, nextBaseTick - offsetTicks);
      } else {
        const duration = isMidi ? songPpq : DEFAULT_CHORD_DURATION;
        endTime = convertedTick + duration;
      }

      finalWords.push({
        text: wordEvent.text,
        start: convertedTick,
        end: endTime,
        length: endTime - convertedTick,
        index: globalWordIndex++,
        lineIndex: lineIndex,
      });
    });
  });

  const convertedChords =
    data.chords
      ?.map((chord) => ({
        ...chord,
        tick: isMidi ? chord.tick : chord.tick / 1000,
      }))
      .sort((a, b) => a.tick - b.tick) || [];

  return { finalWords, convertedChords };
};

export const xmlToArrayRange = (
  lyricsData: LyricWordData[],
  ppq: number = 480,
  mode: MusicMode
): ArrayRange<ISentence> | undefined => {
  const timedWords = lyricsData.filter(
    (w) => w.start !== null && w.end !== null
  );
  if (timedWords.length === 0) return undefined;

  let timestamps: number[] = [];
  if (mode === "MIDI") {
    const generator = new TickLyricSegmentGenerator(ppq);
    timestamps = generator.generateSegment(timedWords);
  } else {
    const generator = new TimestampLyricSegmentGenerator();
    timestamps = generator.generateSegment(timedWords);
  }

  const lyrInline: string[] = [];
  lyricsData.forEach((data) => {
    if (!lyrInline[data.lineIndex]) lyrInline[data.lineIndex] = "";
    lyrInline[data.lineIndex] += data.text;
  });

  const arrayRange = new ArrayRange<ISentence>();
  let cursorIndex = 0;

  lyrInline
    .map((line) => {
      const lineLength = line.length;
      if (lineLength === 0) return undefined;

      const lineCursor = timestamps.slice(
        cursorIndex,
        cursorIndex + lineLength + 1
      );
      cursorIndex += lineLength + 1;
      if (!lineCursor.length) return undefined;

      const [start, ...valueName] = lineCursor;
      const end = valueName[lineLength - 1] || start;
      const value = { text: line, start, valueName, end };
      arrayRange.push([start, end], value);
      return value;
    })
    .filter((x) => x !== undefined);

  return arrayRange;
};
