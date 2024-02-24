interface PathFolders {
  file: File;
  type: NCNType | undefined;
}

type NCNType = "lyr" | "mid" | "cur";
type LoadType = "FOLDER" | "ZIP" | "API";

interface SearchNCN {
  name: string;
  artist: string;
  path: string[];
  filename: string;
  type: "NCN" | "EMK";
}

interface Folder {
  [key: string]: Folder | Record<string, File>;
}

interface IGetSongListApi {
  data: SearchNCN[];
}

interface MiniApiNCN {
  lyr: stirng | File;
  cur: stirng | File;
  mid: stirng | File;
  path: string;
}
interface MiniApiNCNInput {
  type: string;
  path: string;
  path_category: string;
  filename: string;
}
