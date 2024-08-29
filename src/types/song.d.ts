interface SearchResult {
  artist: string;
  fileId: string;
  name: string;
  type: number;
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
