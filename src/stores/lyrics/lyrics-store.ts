import { groupThaiCharacters } from "@/lib/app-control";
import { TickMapper } from "@/lib/spssasynth/tick-mapper";
import { create } from "zustand";
import { ILyricsMapper } from "./types/lyrics.type";
import useRuntimePlayer from "../player/update/modules/runtime-player";

interface LyricsStore {
  charIndex: number;
  lineIndex: number;
  display: string[][];
  displayBottom: string[][];
  position: boolean;
  tickMapper: TickMapper | undefined;
  lyricsMapper: ILyricsMapper[] | undefined;
  lyricsCut: string[];
  lyricsRender: (tick: number) => void;
  lyricsInit: (lyrics: string[], ticksIndices: Map<number, number[]>) => void;
  reset: () => void;
}

const useLyricsStoreNew = create<LyricsStore>((set, get) => ({
  charIndex: 0,
  lineIndex: 0,
  display: [],
  displayBottom: [],
  position: true,
  tickMapper: undefined,
  lyricsMapper: undefined,
  lyricsCut: [],
  reset: () => {
    set({
      charIndex: 0,
      lineIndex: 0,
      display: [],
      displayBottom: [],
      position: true,
      tickMapper: undefined,
      lyricsMapper: undefined,
      lyricsCut: [],
    });
  },
  lyricsRender: (tick) => {
    tick = tick - 85; // Delay
    const tickMapper = get().tickMapper;
    const lyricsMapper = get().lyricsMapper;
    const lyricsCut = get().lyricsCut;
    if (!tickMapper || !lyricsMapper) {
      return;
    }

    const charIndices = tickMapper.getValue(tick);

    charIndices.forEach((index) => {
      const line = lyricsMapper[index];

      const lineIndex = line?.line;
      const charIndex = line?.lineIndex;

      if (!lineIndex || !charIndex) {
        return;
      }

      let displayTop = [];
      let displayBottom = [];
      if (lineIndex % 2 === 0) {
        displayTop = groupThaiCharacters(lyricsCut[lineIndex + 1]);
        displayBottom = groupThaiCharacters(lyricsCut[lineIndex]);
        set({ position: false });
      } else {
        displayTop = groupThaiCharacters(lyricsCut[lineIndex]);
        displayBottom = groupThaiCharacters(lyricsCut[lineIndex + 1]);
        set({ position: true });
      }

      set({
        display: displayTop,
        displayBottom: displayBottom,
        charIndex: charIndex,
        lineIndex: lineIndex,
      });
    });
  },
  lyricsInit: (lyrics, ticksIndices) => {
    get().reset();

    const lyricsMapper = mapingLyricsGroup(lyrics);
    const tickMapper = new TickMapper(ticksIndices);

    let lyricsCut = lyrics.slice(3);

    set({
      lyricsMapper,
      tickMapper,
      lyricsCut,
    });
  },
}));

export default useLyricsStoreNew;

const mapingLyricsGroup = (lyrics: string[]) => {
  lyrics = lyrics.slice(3);
  const lyrs: { line: number; lyr: string; lineIndex: number }[] = [];
  lyrics.map((data, line) => {
    const group = data.split("");
    let lastIndex: number = 0;
    group.map((lyr, lineIndex) => {
      lyrs.push({ line, lyr, lineIndex: lineIndex + 1 });
      lastIndex = lineIndex + 1;
    });
    lyrs.push({ line, lyr: "", lineIndex: lastIndex });
  });

  return lyrs;
};
