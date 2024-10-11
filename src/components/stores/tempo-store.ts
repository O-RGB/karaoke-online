import { create } from "zustand";

interface TempoStore {
  tempo: number;
  setCurrntTempo: (tempo: number) => void;
}

const useTempoStore = create<TempoStore>((set) => ({
  tempo: 0,
  setCurrntTempo: (tempo) =>
    set((state) => ({
      tempo: tempo,
    })),
}));

export default useTempoStore;
