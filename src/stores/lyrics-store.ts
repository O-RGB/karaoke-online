import { create } from "zustand";

interface LyricsStore {
  charIndex: number;
  setCharIndex: (charIndex: number) => void;
  display: string[][];
  setDisplay: (display: string[][]) => void;
  displayBottom: string[][];
  setDisplayBottom: (display: string[][]) => void;
  position: boolean;
  setPosition: (boolean: boolean) => void;
}

const useLyricsStore = create<LyricsStore>((set) => ({
  charIndex: 0,
  setCharIndex: (charIndex) =>
    set((state) => ({
      charIndex: charIndex,
    })),
  display: [],
  setDisplay: (display) =>
    set((state) => ({
      display: display,
    })),
  displayBottom: [],
  setDisplayBottom: (displayBottom) =>
    set((state) => ({
      displayBottom: displayBottom,
    })),
  position: true,
  setPosition: (position) =>
    set((state) => ({
      position: position,
    })),
}));

export default useLyricsStore;
