import { CHANNEL_DEFAULT } from "@/config/value";
import { create } from "zustand";

interface GainStore {
  gain: number[];
  setCurrntGain: (gain: number[]) => void;
  gainMain: number;
  setCurrntGainMain: (gain: number) => void;
}

const useGainStore = create<GainStore>((set) => ({
  gain: CHANNEL_DEFAULT,
  setCurrntGain: (gain) =>
    set((state) => ({
      gain,
    })),
  gainMain: 0,
  setCurrntGainMain: (gainMain) =>
    set((state) => ({
      gainMain,
    })),
}));

export default useGainStore;
