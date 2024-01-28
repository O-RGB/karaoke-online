import Fuse from "fuse.js";
import React from "react";
import TrieSearch from "trie-search";

export interface LoadFileHook {
  Folder: Folder | undefined;
  setFolderProgram: (Folder: Folder) => unknown;
  ZipFile: File | undefined;
  setZipFile: (ZipFile: File) => unknown;
  // extractZipToSongList: (ZipFile: File) => boolean;
  setZipProgram: (zip: File) => Promise<void>;
  SongList: SearchNCN[] | undefined;
  Trie: TrieSearch<SearchNCN> | undefined;
  extractZipByPath: (path: string[]) => Promise<File | undefined>;
  readNCNByPath: (filename: string, path: string[]) => any;
}

export const LoadFileContext = React.createContext<LoadFileHook>({
  Folder: undefined,
  setFolderProgram: () => {},
  ZipFile: undefined,
  setZipFile: (zipFile: File) => {},
  setZipProgram: (zipFile: File) => new Promise<any>(() => {}),
  // extractZipToSongList: () => false,
  SongList: undefined,
  Trie: undefined,
  extractZipByPath: () => new Promise<any>(() => {}),
  readNCNByPath: (filename: string, path: string[]) => undefined,
});
