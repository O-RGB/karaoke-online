import React from "react";

export interface SongHook {
  Lyrics: string[] | undefined;
  Cursor: string[] | undefined;
  Midi: File | undefined;
  setLyrics: (Lyrics: string[]) => unknown;
  setCursor: (Cursor: string[]) => unknown;
  setMidi: (Midi: File) => unknown;
}

export const SongPlayingContext = React.createContext<SongHook>({
  Lyrics: undefined,
  Cursor: undefined,
  Midi: undefined,
  setLyrics: () => {},
  setCursor: () => {},
  setMidi: () => {},
});
