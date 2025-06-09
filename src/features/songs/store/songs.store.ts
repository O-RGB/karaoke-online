import { create } from "zustand";
import { SongsSystem } from "..";

interface SongsStore {
  songsManager: SongsSystem | undefined;
  setSongsManager: (base: SongsSystem) => void;
}

const useSongsStore = create<SongsStore>((set, get) => ({
  songsManager: undefined,
  setSongsManager: (base: SongsSystem) => {
    set({ songsManager: base });
  },
}));

export default useSongsStore;
