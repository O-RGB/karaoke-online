import { create } from "zustand";
import { SongsSystem } from "..";
import { SoundfontSystemManager } from "@/features/soundfont";

interface SongsStore {
  songsManager: SongsSystem | undefined;
  setSongsManager: (base: SongsSystem) => void;
  soundfontBaseManager: SoundfontSystemManager | undefined;
  setSoundfontManaer: (base: SoundfontSystemManager) => void;
}

const useSongsStore = create<SongsStore>((set, get) => ({
  songsManager: undefined,
  setSongsManager: (base: SongsSystem) => {
    set({ songsManager: base });
  },
  soundfontBaseManager: undefined,
  setSoundfontManaer: (base: SoundfontSystemManager) => {
    set({ soundfontBaseManager: base });
  },
}));

export default useSongsStore;
