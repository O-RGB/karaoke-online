import { create } from "zustand";
import { Synthetizer as Spessasynth } from "spessasynth_lib";
import { Synthesizer as JsSynthesizer } from "js-synthesizer";

import { JsSynthEngine } from "./synth/js-synth-engine";
import { SpessaSynthEngine } from "./synth/spessa-synth-engine";
import { BaseSynthEngine } from "./types/synth.type";
import useMixerStoreNew from "../player/event-player/modules/event-mixer-store";
import useConfigStore from "../config/config-store";

export type EngineType = "spessa" | "jsSynth";

interface ISynthesizerEngine {
  engine: BaseSynthEngine | undefined;
  synth: Spessasynth | JsSynthesizer | undefined;
  setup: (engine?: EngineType) => void;
}
export const useSynthesizerEngine = create<ISynthesizerEngine>((set, get) => ({
  engine: undefined,
  synth: undefined,
  setup: async (type: EngineType = "spessa") => {
    const config = useConfigStore.getState().config.sound?.lockBase
    const setInstrument = useMixerStoreNew.getState().setInstrument;
    if (type === "spessa") {
      const spessaSynth = new SpessaSynthEngine(setInstrument, config);
      set({ engine: spessaSynth });
    } else {
      const jsSynth = new JsSynthEngine(setInstrument);
      set({ engine: jsSynth });
    }
  },
}));
