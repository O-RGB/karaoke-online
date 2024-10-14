import { DEFAULT_CONFIG } from "@/config/value";
import { create } from "zustand";

interface ConfigStore {
  config: Partial<ConfigDisplay>;
  setConfig: (
    config:
      | Partial<ConfigDisplay>
      | ((config: Partial<ConfigDisplay>) => ConfigDisplay)
  ) => void;
}

const useConfigStore = create<ConfigStore>((set) => ({
  config: DEFAULT_CONFIG,
  setConfig: (config) =>
    set((state) => ({
      config: typeof config === "function" ? config(state.config) : config,
    })),
}));

export default useConfigStore;
