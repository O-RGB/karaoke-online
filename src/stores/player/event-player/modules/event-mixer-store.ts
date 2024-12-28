import { CHANNEL_DEFAULT } from "@/config/value";
import { useSynthesizerEngine } from "@/stores/engine/synth-store";
import { INodeCallBack } from "@/stores/engine/types/node.type";
import { usePeerStore } from "@/stores/remote/modules/peer-js-store";

import { modulatorSources, NON_CC_INDEX_OFFSET } from "spessasynth_lib";
import { create } from "zustand";

interface MixerStore {
  setEventGain: () => void;

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
  setEventGain: () => {
    const superUserConnections = usePeerStore.getState().superUserConnections;
    const sendSuperUserMessage = usePeerStore.getState().sendSuperUserMessage;

    const gainNode = useSynthesizerEngine.getState().engine?.gainNode;
    if (!gainNode) {
      return;
    }
    const volumes = gainNode.gainChannels();

    if (get().hideMixer) {
      const totalGain = volumes?.reduce((acc, volume) => acc + volume, 0) || 0;
      const mainGain = (totalGain / (volumes.length * 20)) * 100;
      let gainMain = Math.round(mainGain);
      get().setCurrntGainMain(gainMain);
    } else {
      get().setCurrntGain(volumes);
    }

    if (superUserConnections.length > 0) {
      const remoteEvent: INodeCallBack = {
        channel: 0,
        eventType: "GAIN",
        value: volumes,
      };
      sendSuperUserMessage({
        message: remoteEvent,
        user: "SUPER",
      });
    }
  },

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

  uploadLockedPitchWheel: (channel: number, isLocked: boolean) => {
    const engine = useSynthesizerEngine.getState().engine;

    engine?.lockController(
      channel,
      NON_CC_INDEX_OFFSET + modulatorSources.pitchWheel,
      isLocked
    );
  },

  updatePitch: (channel, semitones = 0) => {
    const engine = useSynthesizerEngine.getState().engine;
    engine?.updatePitch(channel, semitones);
  },

  instrument: [],
  setInstrument: (instrument) => {
    console.log("instrument in sotre", instrument);
    set({ instrument });
  },
}));

export default useMixerStoreNew;
