import { PropsWithChildren, useState } from "react";
import { LoadFileContext } from "./test-load-file-context";
import Fuse from "fuse.js";
import TrieSearch from "trie-search";

export const LoadFileProvider = ({ children }: PropsWithChildren) => {
  const [Folder, setFolder] = useState<Folder | undefined>(undefined);
  const [SongList, setSongList] = useState<SearchNCN[] | undefined>(undefined);
  const [Trie, setTrie] = useState<TrieSearch<SearchNCN> | undefined>(
    undefined
  );

  const options = {
    includeScore: true,
    keys: ["name", "artist"],
    score: 0.4,
  };

  const setFolderProgram = (Folder: Folder) => {
    let mainKey = Object.keys(Folder);
    console.log(Folder);
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

  return (
    <LoadFileContext.Provider
      value={{ Folder, SongList, Trie, setFolderProgram }}
    >
      {children}
    </LoadFileContext.Provider>
  );
};
