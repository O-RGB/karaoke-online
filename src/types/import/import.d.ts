interface PathFolders {
  file: File;
  type: NCNType | undefined;
}

type NCNType = "lyr" | "mid" | "cur";
type LoadType = "FOLDER" | "ZIP";

interface SearchNCN {
  name: string;
  artist: string;
  path: string[];
  filename: string;
}

interface Folder {
  [key: string]: Folder | Record<string, File>;
}
