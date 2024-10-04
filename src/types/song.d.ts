interface SearchResult {
  artist: string;
  fileId: string;
  name: string;
  type: number;
  id: string;
}

interface FileGroup extends Partial<SongFiles> {
  emk?: File;
}

interface SongFiltsEncodeAndDecode extends SongFilesDecode {
  encode?: SongFiles;
  emk?: File;
}

interface SongFiles {
  mid: File;
  cur: File;
  lyr: File;
}

interface SongFilesDecode {
  mid: File;
  cur: number[];
  lyr: string[];
}

interface CursorTick {
  tick: number;
}

interface CursorList {
  tempo: number;
  ticks: CursorTick[];
}

interface DisplayLyrics {
  display: string[][];
  displayBottom: string[][];
  position: boolean;
  charIndex: number;
}
