import {
  CHANNEL_DEFAULT,
  VOLUME_DEFAULT,
  VOLUME_MIDDLE_DEFAULT_128,
} from "@/config/value";
import { create } from "zustand";

interface MixerStore {
  volumes: number[];
  setVolumes: (volume: number[] | ((prev: number[]) => number[])) => void;
  pan: number[];
  setPan: (pan: number[] | ((prev: number[]) => number[])) => void;
  reverb: number[];
  setReverb: (pan: number[] | ((prev: number[]) => number[])) => void;
  chorusDepth: number[];
  setChorusDepth: (pan: number[] | ((prev: number[]) => number[])) => void;
  isMute: boolean[];
  setMute: (isMute: boolean[] | ((prev: boolean[]) => boolean[])) => void;
  gain: number[];
  setCurrntGain: (gain: number[]) => void;
  gainMain: number;
  setCurrntGainMain: (gain: number) => void;
  hideMixer: boolean;
  setHideMixer: (isHide: boolean) => void;
  held: boolean;
  setHeld: (isHeld: boolean) => void;
}

const useMixerStore = create<MixerStore>((set) => ({
  volumes: VOLUME_DEFAULT,
  setVolumes: (volume) =>
    set((state) => ({
      volumes: typeof volume === "function" ? volume(state.volumes) : volume,
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
  hideMixer: false,
  setHideMixer: (hideMixer) =>
    set((state) => ({
      hideMixer,
    })),
  held: false,
  setHeld: (held) =>
    set((state) => ({
      held,
    })),
}));

export default useMixerStore;
