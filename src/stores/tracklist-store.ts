import TrieSearch from "trie-search";
import { create } from "zustand";

const useTracklistStore = create<TrackListStore>((set) => ({
  tracklist: undefined,
  setTracklist: (tracklist) =>
    set((state) => ({
      tracklist,
    })),
}));

export default useTracklistStore;
