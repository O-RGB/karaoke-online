import { VOLUME_DEFAULT, VOLUME_MIDDLE_DEFAULT_128 } from "@/config/value";
import { create } from "zustand";

interface VolumeStore {
  volume: number[];
  setVolume: (instrument: number[] | ((prev: number[]) => number[])) => void;
  pan: number[];
  setPan: (pan: number[] | ((prev: number[]) => number[])) => void;
  reverb: number[];
  setReverb: (pan: number[] | ((prev: number[]) => number[])) => void;
  chorusDepth: number[];
  setChorusDepth: (pan: number[] | ((prev: number[]) => number[])) => void;
  isMute: boolean[];
  setMute: (isMute: boolean[] | ((prev: boolean[]) => boolean[])) => void;
}

const useVolumeStore = create<VolumeStore>((set) => ({
  volume: VOLUME_DEFAULT,
  setVolume: (volume) =>
    set((state) => ({
      volume: typeof volume === "function" ? volume(state.volume) : volume,
    })),
  pan: VOLUME_MIDDLE_DEFAULT_128,
  setPan: (pan) =>
    set((state) => ({
      pan: typeof pan === "function" ? pan(state.pan) : pan,
    })),
  reverb: VOLUME_MIDDLE_DEFAULT_128,
  setReverb: (reverb) =>
    set((state) => ({
      reverb: typeof reverb === "function" ? reverb(state.reverb) : reverb,
    })),
  chorusDepth: VOLUME_MIDDLE_DEFAULT_128,
  setChorusDepth: (chorusDepth) =>
    set((state) => ({
      chorusDepth:
        typeof chorusDepth === "function"
          ? chorusDepth(state.chorusDepth)
          : chorusDepth,
    })),
  isMute: VOLUME_DEFAULT.map((v) => false),
  setMute: (isMute) =>
    set((state) => ({
      isMute: typeof isMute === "function" ? isMute(state.isMute) : isMute,
    })),
}));

export default useVolumeStore;
