import { PropsWithChildren, useEffect, useState } from "react";
import { LoadFileContext } from "./test-load-file-context";
import TrieSearch from "trie-search";

export const LoadFileProvider = ({ children }: PropsWithChildren) => {
  const [Folder, setFolder] = useState<Folder | undefined>(undefined);
  const [SongList, setSongList] = useState<SearchNCN[] | undefined>(undefined);
  const [Trie, setTrie] = useState<TrieSearch<SearchNCN> | undefined>(
    undefined
  );

  function getValueFromPath(path: string[], data: Folder): File | undefined {
    let current: any = data;
    for (const key of path) {
      if (current.hasOwnProperty(key)) {
        current = current[key] as Folder;
      } else {
        return undefined;
      }
    }
    return current;
  }

  const readNCNByPath = (filename: string, path: string[]) => {
    if (Folder && path) {
      let firstPath = path[0];
      let getSearch = path.map((v) => v);
      getSearch = getSearch.splice(1, getSearch.length);
      let main = "Cursor";
      let cur = getValueFromPath(
        [firstPath, main, ...getSearch, filename + ".cur"],
        Folder
      );
      main = "Lyrics";
      let lyr = getValueFromPath(
        [firstPath, main, ...getSearch, filename + ".lyr"],
        Folder
      );
      main = "Song";
      let mid = getValueFromPath(
        [firstPath, main, ...getSearch, filename + ".mid"],
        Folder
      );
      return {
        cur,
        lyr,
        mid,
      };
    } else {
      return undefined;
    }
  };

  const setFolderProgram = (Folder: Folder) => {
    let mainKey = Object.keys(Folder);
    if (mainKey.length == 1) {
      let song_list: File = Folder[mainKey[0]]["song_list.json"] as File;
      if (song_list) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          try {
            const contentArrayBuffer = e.target.result;
            let parsedJSON = JSON.parse(contentArrayBuffer) as SearchNCN[];
            setSongList(parsedJSON);
            const trie = new TrieSearch<SearchNCN>(["name", "artist"]);
            trie.addAll(parsedJSON);
            setTrie(trie);
          } catch (error) {}
        };
        reader.readAsText(song_list as File);
      }
    }
    setFolder(Folder);
  };

  useEffect(() => {}, [Folder]);

  return (
    <LoadFileContext.Provider
      value={{ Folder, SongList, Trie, setFolderProgram, readNCNByPath }}
    >
      {children}
    </LoadFileContext.Provider>
  );
};
