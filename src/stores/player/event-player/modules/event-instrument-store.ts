import { CHANNEL_DEFAULT } from "@/config/value";
import { create } from "zustand";

interface InstrumentStore {
  instrument: number[];
  setInstrument: (
    instrument: number[] | ((prev: number[]) => number[])
  ) => void;
}

const useInstrumentStore = create<InstrumentStore>((set) => ({
  instrument: CHANNEL_DEFAULT,
  setInstrument: (instrument) =>
    set((state) => ({
      instrument:
        typeof instrument === "function"
          ? instrument(state.instrument)
          : instrument,
    })),
}));

export default useInstrumentStore;
