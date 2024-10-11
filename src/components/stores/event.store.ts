import { CHANNEL_DEFAULT, VOLUME_DEFAULT } from "@/config/value";
import { create } from "zustand";
interface EventStore {
  instrument: number[];
  setInstrument: (
    instrument: number[] | ((prev: number[]) => number[])
  ) => void;
}

const useEventStore = create<EventStore>((set) => ({
  instrument: CHANNEL_DEFAULT,
  setInstrument: (instrument) =>
    set((state) => ({
      instrument:
        typeof instrument === "function"
          ? instrument(state.instrument)
          : instrument,
    })),
}));

export default useEventStore;
