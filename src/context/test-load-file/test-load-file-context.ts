import Fuse from "fuse.js";
import React from "react";
import TrieSearch from "trie-search";

export interface LoadFileHook {
  Folder: Folder | undefined;
  SongList: SearchNCN[] | undefined;
  Trie: TrieSearch<SearchNCN> | undefined;
  setFolderProgram: (Folder: Folder) => unknown;
  readNCNByPath: (
    filename: string,
    path: string[]
  ) =>
    | {
        cur: File | undefined;
        lyr: File | undefined;
        mid: File | undefined;
      }
    | undefined;
}

export const LoadFileContext = React.createContext<LoadFileHook>({
  Folder: undefined,
  SongList: undefined,
  Trie: undefined,
  setFolderProgram: () => {},
  readNCNByPath: (filename: string, path: string[]) => undefined,
});
