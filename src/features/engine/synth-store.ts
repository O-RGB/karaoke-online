//src/features/engine/synth-store.ts
import { create } from "zustand";
import { Synthetizer as Spessasynth } from "spessasynth_lib";
import { Synthesizer as JsSynthesizer } from "js-synthesizer";

import { JsSynthEngine } from "./modules/js-synthesizer/js-synth-engine";
import { SpessaSynthEngine } from "./modules/spessasynth/spessa-synth-engine";
import { BaseSynthEngine } from "./types/synth.type";
import useMixerStoreNew from "../player/event-player/modules/event-mixer-store";
import useConfigStore from "../config/config-store";
import { usePeerStore } from "../remote/modules/peer-js-store";

export type EngineType = "spessa" | "jsSynth";

interface ISynthesizerEngine {
  engine: BaseSynthEngine | undefined;
  synth: Spessasynth | JsSynthesizer | undefined;
  setup: (engine?: EngineType) => Promise<BaseSynthEngine>;
  uninsatll: () => void;
}
export const useSynthesizerEngine = create<ISynthesizerEngine>((set, get) => ({
  engine: undefined,
  synth: undefined,
  setup: async (type: EngineType = "spessa") => {
    const sendSuperUserMessage = usePeerStore.getState().sendSuperUserMessage;
    const config = useConfigStore.getState().config.sound;
    const configs = useConfigStore.getState().config;
    const setInstrument = useMixerStoreNew.getState().setInstrument;
    if (type === "spessa") {
      const spessaSynth = new SpessaSynthEngine(
        setInstrument,
        sendSuperUserMessage,
        config,
        configs
      );
      set({ engine: spessaSynth });
      return spessaSynth;
    } else {
      const jsSynth = new JsSynthEngine(setInstrument);
      set({ engine: jsSynth });
      return jsSynth;
    }
  },
  uninsatll: async () => {
    await get().engine?.unintsall();
    set({ engine: undefined, synth: undefined });
  },
}));
