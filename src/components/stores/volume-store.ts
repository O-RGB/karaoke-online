import { CHANNEL_DEFAULT, VOLUME_DEFAULT } from "@/config/value";
import { create } from "zustand";

interface VolumeStore {
  volume: number[];
  setVolume: (instrument: number[] | ((prev: number[]) => number[])) => void;
}

const useVolumeStore = create<VolumeStore>((set) => ({
  volume: VOLUME_DEFAULT,
  setVolume: (volume) =>
    set((state) => ({
      volume: typeof volume === "function" ? volume(state.volume) : volume,
    })),
}));

export default useVolumeStore;
