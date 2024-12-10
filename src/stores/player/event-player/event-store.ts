import { CHANNEL_DEFAULT } from "@/config/value";
import { useSpessasynthStore } from "@/stores/spessasynth-store";
import { create } from "zustand";
import useInstrumentStore from "./modules/event-instrument-store";
import useMixerStoreNew from "./modules/event-mixer-store";

interface EventStore {
  instrument: number[];
  setInstrument: (
    instrument: number[] | ((prev: number[]) => number[])
  ) => void;
  setEventRun: (start: boolean) => void;
  setGainRun: () => void;
}

const useEventStoreNew = create<EventStore>((set) => ({
  instrument: CHANNEL_DEFAULT,
  setInstrument: (instrument) =>
    set((state) => ({
      instrument:
        typeof instrument === "function"
          ? instrument(state.instrument)
          : instrument,
    })),
  setEventRun: () => {
    const synth = useSpessasynthStore.getState().synth;

    const setInstrument = useInstrumentStore.getState().setInstrument;
    const setEventController = useMixerStoreNew.getState().setEventController;
    synth?.eventHandler.addEvent("programchange", "", (e) => {
      const channel: number = e.channel;
      const program: number = e.program;
      setInstrument((prevInstrument) => {
        const newInstrument = [...prevInstrument];
        newInstrument[channel] = program;
        return newInstrument;
      });
    });

    synth?.eventHandler.addEvent("controllerchange", "", (e) => {
      const { controllerNumber, controllerValue, channel } = e;
      setEventController(controllerNumber, controllerValue, channel);
    });
  },

  setGainRun: () => {
    const analysers = useSpessasynthStore.getState().analysers;
    const setEventGain = useMixerStoreNew.getState().setEventGain;

    const newVolumeLevels = analysers?.map((analyser) => {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      const value = Math.round(
        dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length
      );
      return value;
    });

    setEventGain(newVolumeLevels);
  },
}));

export default useEventStoreNew;
