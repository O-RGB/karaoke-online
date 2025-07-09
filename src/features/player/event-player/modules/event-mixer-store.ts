import { CHANNEL_DEFAULT } from "@/config/value";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
// import { usePeerStore } from "@/features/remote/modules/peer-js-store";
import { create } from "zustand";
interface MixerStore {
  gain: number[];
  setCurrntGain: (gain: number[]) => void;

  gainMain: number;
  setCurrntGainMain: (gain: number) => void;

  hideMixer: boolean;
  setHideMixer: (isHide: boolean) => void;

  updatePitch: (channel: number | null, semitones: number) => void;

  instrument: IPersetSoundfont[];
  setInstrument: (instrument: IPersetSoundfont[]) => void;
}

const useMixerStoreNew = create<MixerStore>((set, get) => ({
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

  updatePitch: (channel, semitones = 0) => {
    const engine = useSynthesizerEngine.getState().engine;
    engine?.updatePitch(channel, semitones);
  },

  instrument: [],
  setInstrument: (instrument) => {
    set({ instrument });
  },
}));

export default useMixerStoreNew;
