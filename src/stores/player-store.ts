import { VOLUME_DEFAULT } from "@/config/value";
import { create } from "zustand";

interface VolumeStore {
  volume: number[];
  setVolume: (instrument: number[] | ((prev: number[]) => number[])) => void;
  isMute: boolean[];
  setMute: (isMute: boolean[] | ((prev: boolean[]) => boolean[])) => void;
}

const useVolumeStore = create<VolumeStore>((set) => ({
  volume: VOLUME_DEFAULT,
  setVolume: (volume) =>
    set((state) => ({
      volume: typeof volume === "function" ? volume(state.volume) : volume,
    })),
  isMute: VOLUME_DEFAULT.map((v) => false),
  setMute: (isMute) =>
    set((state) => ({
      isMute: typeof isMute === "function" ? isMute(state.isMute) : isMute,
    })),
}));

export default useVolumeStore;
