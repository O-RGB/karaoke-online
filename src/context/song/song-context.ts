import React from "react";

export interface SongHook {
  Lyrics: string[];
  setLyrics: (Lyrics: string[]) => unknown;
}

export const SongContext = React.createContext<SongHook>({
  Lyrics: [],
  setLyrics: () => {},
});
