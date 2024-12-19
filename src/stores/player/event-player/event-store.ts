import { CHANNEL_DEFAULT } from "@/config/value";

import { create } from "zustand";
import useMixerStoreNew from "./modules/event-mixer-store";
import { useSynthesizerEngine } from "@/stores/engine/synth-store";
import { get } from "http";

interface EventStore {
  setEventRun: (start: boolean) => void;
  setGainRun: () => void;

  bassLock?: number | undefined;
  setBassLock?: (bassNumber: number) => void;
}

const useEventStoreNew = create<EventStore>((set, get) => ({
  setEventRun: () => {
    const engine = useSynthesizerEngine.getState().engine;

    const setEventController = useMixerStoreNew.getState().setEventController;
    const setProgramList = useMixerStoreNew.getState().setProgramList;
    const setInstrument = useMixerStoreNew.getState().setInstrument;

    engine?.programChange((event) => {
      const { channel, program } = event;

      setProgramList((prevInstrument) => {
        const newInstrument = [...prevInstrument];
        newInstrument[channel] = program;
        return newInstrument;
      });
    });

    engine?.controllerChange((event) => {
      const { controllerNumber, controllerValue, channel } = event;
      setEventController(controllerNumber, controllerValue, channel);
    });

    engine?.persetChange((event) => {
      setInstrument(event);
    });
  },

  setGainRun: () => {
    const analysers = useSynthesizerEngine.getState().engine?.analysers;

    if (!analysers) {
      return;
    }
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
  bassLock: undefined,
  setBassLock: (bassNumber) => {
    set({ bassLock: bassNumber });
  },
}));

export default useEventStoreNew;
