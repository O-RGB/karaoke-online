import {
  CHANNEL_BOOLEAN,
  CHANNEL_DEFAULT,
  VOLUME_DEFAULT,
  VOLUME_MIDDLE_DEFAULT_128,
} from "@/config/value";
import { useSynthesizerEngine } from "@/stores/engine/synth-store";
import { IControllerChange } from "@/stores/engine/types/synth.type";
import { usePeerStore } from "@/stores/remote/modules/peer-js-store";

import {
  midiControllers,
  modulatorSources,
  NON_CC_INDEX_OFFSET,
} from "spessasynth_lib";
import { create } from "zustand";

interface MixerStore {
  setEventController: (event: IControllerChange, isUser?: boolean) => void;

  setEventGain: (analysersLevels: number[]) => void;

  volumes: number[];
  setVolumes: (channel: number, value: number, synthUpdate: boolean) => void;
  volLocked: boolean[];
  setVolLock: (channel: number, isLock: boolean, synthUpdate: boolean) => void;

  pan: number[];
  setPan: (channel: number, value: number, synthUpdate: boolean) => void;

  reverb: number[];
  setReverb: (channel: number, value: number, synthUpdate: boolean) => void;

  chorusDepth: number[];
  setChorusDepth: (
    channel: number,
    value: number,
    synthUpdate: boolean
  ) => void;

  gain: number[];
  setCurrntGain: (gain: number[]) => void;

  gainMain: number;
  setCurrntGainMain: (gain: number) => void;

  hideMixer: boolean;
  setHideMixer: (isHide: boolean) => void;

  updatePitch: (channel: number | null, semitones: number) => void;
  uploadLockedPitchWheel: (channel: number, isLocked: boolean) => void;
  updatePreset: (channel: number, value: number) => void;

  isMute: boolean[];
  setMute: (channel: number, isMuted: boolean) => void;

  programList: number[];
  setProgramList: (
    programList: number[] | ((prev: number[]) => number[])
  ) => void;

  instrument: IPersetSoundfont[];
  setInstrument: (instrument: IPersetSoundfont[]) => void;
}

const useMixerStoreNew = create<MixerStore>((set, get) => ({
  setEventController: (event: IControllerChange, isUser) => {
    const superUserConnections = usePeerStore.getState().superUserConnections;
    const sendSuperUserMessage = usePeerStore.getState().sendSuperUserMessage;
    const engine = useSynthesizerEngine.getState().engine;

    if (superUserConnections.length > 0) {
      sendSuperUserMessage({
        message: event,
        type: "CONTROLLER",
        user: "SUPER",
      });
    }

    switch (event.controllerNumber) {
      case midiControllers.mainVolume:
        get().setVolumes(event.channel, event.controllerValue, false);
        break;
      case midiControllers.pan:
        get().setPan(event.channel, event.controllerValue, false);
        break;
      case 91:
        get().setReverb(event.channel, event.controllerValue, false);
        break;
      case 93:
        get().setChorusDepth(event.channel, event.controllerValue, false);
        break;
      default:
        break;
    }
  },
  setEventGain: (analysersLevels: number[]) => {
    const superUserConnections = usePeerStore.getState().superUserConnections;
    const sendSuperUserMessage = usePeerStore.getState().sendSuperUserMessage;

    if (get().hideMixer) {
      const totalGain =
        analysersLevels?.reduce((acc, volume) => acc + volume, 0) || 0;
      const mainGain = (totalGain / (analysersLevels.length * 20)) * 100;
      let gainMain = Math.round(mainGain);
      get().setCurrntGainMain(gainMain);
    } else {
      let gain = analysersLevels;
      get().setCurrntGain(gain);
    }

    if (superUserConnections.length > 0) {
      sendSuperUserMessage({
        message: analysersLevels,
        type: "GIND_NODE",
        user: "SUPER",
      });
    }
  },
  volumes: VOLUME_DEFAULT,
  setVolumes: (channel, value, synthUpdate) => {
    let volumes = [...get().volumes];
    volumes[channel] = value;

    set({ volumes });
    if (synthUpdate) {
      const engine = useSynthesizerEngine.getState().engine;

      const locked = get().volLocked[channel];
      if (locked) {
        engine?.lockController(channel, midiControllers.mainVolume, false);
      }
      engine?.setController(channel, midiControllers.mainVolume, value);
      if (locked) {
        engine?.lockController(channel, midiControllers.mainVolume, true);
      }
    }
  },
  setVolLock: (channel, isLock, synthUpdate) => {
    let volLocked = [...get().volLocked];
    volLocked[channel] = isLock;

    set({ volLocked });
    if (synthUpdate) {
      const engine = useSynthesizerEngine.getState().engine;
      engine?.lockController(channel, midiControllers.mainVolume, isLock);
    }
  },
  volLocked: CHANNEL_BOOLEAN,
  pan: VOLUME_MIDDLE_DEFAULT_128,
  setPan: (channel, value, synthUpdate) => {
    let pan = [...get().pan];
    pan[channel] = value;

    set({ pan });

    if (synthUpdate) {
      const engine = useSynthesizerEngine.getState().engine;
      engine?.setController(channel, midiControllers.pan, value);
    }
  },
  reverb: VOLUME_MIDDLE_DEFAULT_128,
  setReverb: (channel, value, synthUpdate) => {
    let reverb = [...get().reverb];
    reverb[channel] = value;

    set({ reverb });

    if (synthUpdate) {
      const engine = useSynthesizerEngine.getState().engine;
      engine?.setController(channel, 91, value);
    }
  },
  chorusDepth: VOLUME_MIDDLE_DEFAULT_128,
  setChorusDepth: (channel, value, synthUpdate) => {
    let chorusDepth = [...get().chorusDepth];
    chorusDepth[channel] = value;

    set({ chorusDepth });

    if (synthUpdate) {
      const engine = useSynthesizerEngine.getState().engine;
      engine?.setController(channel, 93, value);
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
  updatePreset: (channel, value) => {
    const engine = useSynthesizerEngine.getState().engine;
    engine?.setProgram(channel, value);
  },

  isMute: VOLUME_DEFAULT.map((v) => false),
  setMute: (channel, isMuted) => {
    const engine = useSynthesizerEngine.getState().engine;

    if (!engine) {
      return;
    }

    let isMute = [...get().isMute];
    isMute[channel] = isMuted;

    engine?.setMute(channel, isMuted);
    set({ isMute });
  },

  programList: CHANNEL_DEFAULT,
  setProgramList: (programList) =>
    set((state) => ({
      programList:
        typeof programList === "function"
          ? programList(state.programList)
          : programList,
    })),

  instrument: [],
  setInstrument: (instrument) => {
    console.log("instrument in sotre", instrument)
    set({ instrument });
  },
}));

export default useMixerStoreNew;
