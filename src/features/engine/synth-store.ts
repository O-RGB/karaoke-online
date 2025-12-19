import { create } from "zustand";
import { Synthetizer as Spessasynth } from "spessasynth_lib";
import { Synthesizer as JsSynthesizer } from "js-synthesizer";
import { JsSynthEngine } from "./modules/js-synthesizer/js-synth-engine";
import { BaseSynthEngine } from "./types/synth.type";
import { TimerWorker } from "./modules/timer";
import { usePeerHostStore } from "../remote/store/peer-js-store";
import useConfigStore from "../config/config-store";
import useMixerStoreNew from "../player/event-player/modules/event-mixer-store";

export type EngineType = "spessa" | "jsSynth";

export interface ISynthesizerEngine {
  type: EngineType;
  engine: BaseSynthEngine | undefined;
  synth: JsSynthesizer | undefined;
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
    const configs = useConfigStore.getState().config;
    const peerHost = usePeerHostStore.getState();
    const jsSynth = new JsSynthEngine(configs, peerHost);
    set({ engine: jsSynth, timer: jsSynth.timer, type });
    console.info("[jsSynth] Synth engine started...");
    return jsSynth;
  },

  uninsatll: async () => {
    await get().engine?.unintsall();
    set({ engine: undefined, synth: undefined });
  },
}));
