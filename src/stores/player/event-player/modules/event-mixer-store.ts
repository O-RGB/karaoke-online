import {
  CHANNEL_DEFAULT,
  VOLUME_DEFAULT,
  VOLUME_MIDDLE_DEFAULT_128,
} from "@/config/value";
import { useSynthesizerEngine } from "@/stores/engine/synth-store";
import { usePeerStore } from "@/stores/remote/modules/peer-js-store";

import {
  midiControllers,
  modulatorSources,
  NON_CC_INDEX_OFFSET,
} from "spessasynth_lib";
import { create } from "zustand";

interface MixerStore {
  setEventController: (
    controllerNumber: number,
    controllerValue: number,
    channel: number
  ) => void;

  setEventGain: (analysersLevels: number[]) => void;

  volumes: number[];
  setVolumes: (channel: number, value: number, synthUpdate: boolean) => void;

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

  held: boolean;
  setHeld: (isHeld: boolean) => void;

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
  setEventController: (
    controllerNumber: number,
    controllerValue: number,
    channel: number
  ) => {
    switch (controllerNumber) {
      case midiControllers.mainVolume:
        get().setVolumes(channel, controllerValue, false);
        break;
      case midiControllers.pan:
        get().setPan(channel, controllerValue, false);
        break;
      case 91:
        get().setReverb(channel, controllerValue, false);
        break;
      case 93:
        get().setChorusDepth(channel, controllerValue, false);
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
    const superUserConnections = usePeerStore.getState().superUserConnections;
    const sendSuperUserMessage = usePeerStore.getState().sendSuperUserMessage;

    let volumes = [...get().volumes];
    volumes[channel] = value;

    if (superUserConnections.length > 0) {
      sendSuperUserMessage({
        message: volumes,
        type: "VOLUMES",
        user: "SUPER",
      });
    }

    set({ volumes });
    if (synthUpdate) {
      const engine = useSynthesizerEngine.getState().engine;
      engine?.setController(channel, midiControllers.mainVolume, value);
    }
  },
  pan: VOLUME_MIDDLE_DEFAULT_128,
  setPan: (channel, value, synthUpdate) => {
    const superUserConnections = usePeerStore.getState().superUserConnections;
    const sendSuperUserMessage = usePeerStore.getState().sendSuperUserMessage;

    let pan = [...get().pan];
    pan[channel] = value;

    if (superUserConnections.length > 0) {
      sendSuperUserMessage({
        message: pan,
        type: "PAN",
        user: "SUPER",
      });
    }

    set({ pan });

    if (synthUpdate) {
      const engine = useSynthesizerEngine.getState().engine;
      engine?.setController(channel, midiControllers.pan, value);
    }
  },
  reverb: VOLUME_MIDDLE_DEFAULT_128,
  setReverb: (channel, value, synthUpdate) => {
    const superUserConnections = usePeerStore.getState().superUserConnections;
    const sendSuperUserMessage = usePeerStore.getState().sendSuperUserMessage;

    let reverb = [...get().reverb];
    reverb[channel] = value;

    if (superUserConnections.length > 0) {
      sendSuperUserMessage({
        message: reverb,
        type: "REVERB",
        user: "SUPER",
      });
    }

    set({ reverb });

    if (synthUpdate) {
      const engine = useSynthesizerEngine.getState().engine;
      engine?.setController(channel, 91, value);
    }
  },
  chorusDepth: VOLUME_MIDDLE_DEFAULT_128,
  setChorusDepth: (channel, value, synthUpdate) => {
    const superUserConnections = usePeerStore.getState().superUserConnections;
    const sendSuperUserMessage = usePeerStore.getState().sendSuperUserMessage;

    let chorusDepth = [...get().chorusDepth];
    chorusDepth[channel] = value;

    if (superUserConnections.length > 0) {
      sendSuperUserMessage({
        message: chorusDepth,
        type: "CHORUSDEPTH",
        user: "SUPER",
      });
    }

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
  held: false,
  setHeld: (held) =>
    set((state) => ({
      held,
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
    set({ instrument });
  },
}));

export default useMixerStoreNew;
