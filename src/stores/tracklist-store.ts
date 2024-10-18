import { addAllTrie, onSearchList } from "@/lib/trie-search";
import TrieSearch from "trie-search";
import { create } from "zustand";

interface TrackListStore {
  tracklist: TrieSearch<SearchResult> | undefined;
  setTracklist: (tracklist: SearchResult[]) => void;
  searchTracklist: (value: string) => Promise<SearchResult[]> | undefined;
  addTracklist: (trackList: SearchResult[]) => void
  removeTracklist: () => void
}

const useTracklistStore = create<TrackListStore>((set, get) => ({
  tracklist: undefined,

  setTracklist: (tracklist: SearchResult[]) => {
    const trie = addAllTrie<SearchResult>(tracklist);
    set(() => ({
      tracklist: trie,
    }));
  },

  addTracklist: (trackList: SearchResult[]) => {
    const { tracklist } = get();
    if (tracklist) {
      const updatedTrie = tracklist;
      trackList.forEach((item) => updatedTrie.add(item));
      set(() => ({
        tracklist: updatedTrie,
      }));
    } else {
      const trie = addAllTrie(trackList);
      set(() => ({
        tracklist: trie,
      }));
    }
  },
  removeTracklist: () => {
    set(() => ({ tracklist: undefined }));
  },
  searchTracklist: (value: string) => {
    const { tracklist } = get();
    if (!tracklist) return undefined;
    return onSearchList<SearchResult>(value, tracklist);
  },
}));
export default useTracklistStore;

// const onSearchStrList = (str: string) => {
//   if (!tracklist) {
//     return;
//   }
//   return onSearchList<SearchResult>(str, tracklist);
// };

// // const setTracklistFile = async (file: File) => {
// //   const toDatabase = await jsonTracklistToDatabase(file);
// //   if (toDatabase) {
// //     const trie = addAllTrie(toDatabase);
// //     setTracklist(trie);
// //   }
// // };

// // const addTracklist = (items: SearchResult[]) => {
// //   if (tracklist) {
// //     const updatedTrie = tracklist;
// //     items.forEach((item) => updatedTrie.add(item));
// //     setTracklist(updatedTrie);
// //   } else {
// //     const trie = addAllTrie(items);
// //     setTracklist(trie);
// //   }
// // };

// // const setRemoveTracklistFile = async () => {
// //   setTracklist(undefined);
// // };
