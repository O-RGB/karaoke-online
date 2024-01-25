import { PropsWithChildren, useState } from "react";
import { SongContext } from "./song-context";

export const SongProvider = ({ children }: PropsWithChildren) => {
  const [Lyrics, setLyrics] = useState<string[]>([]);
  return (
    <SongContext.Provider value={{ Lyrics: Lyrics, setLyrics: setLyrics }}>
      {children}
    </SongContext.Provider>
  );
};
