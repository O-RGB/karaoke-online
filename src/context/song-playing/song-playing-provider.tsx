import { PropsWithChildren, useState } from "react";
import { SongPlayingContext } from "./song-playing-context";

export const SongPlayingProvider = ({ children }: PropsWithChildren) => {
  const [Lyrics, setLyrics] = useState<string[] | undefined>(undefined);
  const [Cursor, setCursor] = useState<string[] | undefined>(undefined);
  const [Midi, setMidi] = useState<File | undefined>(undefined);
  return (
    <SongPlayingContext.Provider
      value={{ Lyrics, Cursor, Midi, setLyrics, setCursor, setMidi }}
    >
      {children}
    </SongPlayingContext.Provider>
  );
};
