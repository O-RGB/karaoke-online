import { create } from "zustand";
import { Synthetizer as Spessasynth } from "spessasynth_lib";
import { Synthesizer as JsSynthesizer } from "js-synthesizer";
import { JsSynthEngine } from "./modules/js-synthesizer/js-synth-engine";
import { SpessaSynthEngine } from "./modules/spessasynth/spessa-synth-engine";
import { BaseSynthEngine } from "./types/synth.type";
import useConfigStore from "../config/config-store";
import { TimerWorker } from "./modules/timer";
import useMixerStoreNew from "../player/event-player/modules/event-mixer-store";

export type EngineType = "spessa" | "jsSynth";

export interface ISynthesizerEngine {
  type: EngineType;
  engine: BaseSynthEngine | undefined;
  synth: Spessasynth | JsSynthesizer | undefined;
  timer: TimerWorker | undefined;
  setup: (engine?: EngineType) => Promise<BaseSynthEngine>;
  uninsatll: () => void;
}
export const useSynthesizerEngine = create<ISynthesizerEngine>((set, get) => ({
  type: "spessa",
  engine: undefined,
  synth: undefined,
  timer: undefined,
  setup: async (type: EngineType = "spessa") => {
    const config = useConfigStore.getState().config.sound;
    const configs = useConfigStore.getState().config;
    const setInstrument = useMixerStoreNew.getState().setInstrument;
    if (type === "spessa") {
      const spessaSynth = new SpessaSynthEngine(setInstrument, config, configs);
      set({ engine: spessaSynth, timer: spessaSynth.timer, type });
      console.info("[Spessa] Synth engine started...");
      return spessaSynth;
    } else {
      const jsSynth = new JsSynthEngine(setInstrument);
      set({ engine: jsSynth, timer: jsSynth.timer, type });
      console.info("[jsSynth] Synth engine started...");
      return jsSynth;
    }
  },

  uninsatll: async () => {
    await get().engine?.unintsall();
    set({ engine: undefined, synth: undefined });
  },
}));
