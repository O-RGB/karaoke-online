import { LyricEvent, SongInfo } from "../../songs/midi/types";
import { LyricWordData } from "../../songs/types";

export function groupLyricsByLine(words: LyricWordData[]): LyricWordData[][] {
  const groupedLyrics: LyricWordData[][] = [];
  for (const word of words) {
    if (!groupedLyrics[word.lineIndex]) {
      groupedLyrics[word.lineIndex] = [];
    }
    groupedLyrics[word.lineIndex].push(word);
  }
  return groupedLyrics;
}

export function gorupLyricWordDataToLyrics(
  words: LyricWordData[][],
  metadata: SongInfo
): string[] {
  let lyrs: string[] = [
    metadata.TITLE,
    metadata.ARTIST,
    metadata.KEY ?? "Cm",
    "",
  ];

  words.map((wordsLine, i) => {
    let lyr: string = "";
    wordsLine.map((word, j) => {
      lyr += word.text;
    });
    lyrs.push(lyr);
  });
  console.log("gorupLyricWordDataToLyrics lyrs", lyrs);
  return lyrs;
}

export function groupWordDataToEvents(
  words: LyricWordData[] | LyricWordData[][],
  tickConverter?: (tick: number) => number
): LyricEvent[][] {
  const flatWords: LyricWordData[] = Array.isArray(words[0])
    ? (words as LyricWordData[][]).flat()
    : (words as LyricWordData[]);

  const groupedEvents: LyricEvent[][] = [];

  for (const word of flatWords) {
    if (!groupedEvents[word.lineIndex]) {
      groupedEvents[word.lineIndex] = [];
    }

    const tick = tickConverter
      ? tickConverter(word.start ?? 0)
      : word.start ?? 0;

    groupedEvents[word.lineIndex].push({
      text: word.text,
      tick,
    });
  }

  // เรียงลำดับภายในแต่ละบรรทัดตาม tick
  return groupedEvents.map((line) => line.sort((a, b) => a.tick - b.tick));
}

export const mapEventsToWordData = (
  lines: LyricEvent[][],
  cursorToTick?: (cursor: number) => number
): LyricWordData[] => {
  const convert = (tick: number) => (cursorToTick ? cursorToTick(tick) : tick);

  return lines.flatMap((line, lineIndex) =>
    line.map((event, index) => {
      const start = convert(event.tick);
      const next = line[index + 1];
      const end = next ? convert(next.tick) : null;

      return {
        text: event.text,
        start,
        end,
        length: end !== null ? end - start : 0,
        index,
        lineIndex,
      };
    })
  );
};
