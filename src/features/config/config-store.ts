import { DEFAULT_CONFIG, CONFIG_VERSION, FORCE_CONFIG } from "@/config/value";
import { create } from "zustand";
import { ConfigStoreProps } from "./types/config.type";

const deepMerge = (target: any, source: any): any => {
  if (typeof source !== "object" || source === null) {
    return source;
  }
  if (Array.isArray(source)) {
    return [...source];
  }

  const output = { ...target };
  Object.keys(source).forEach((key) => {
    if (typeof source[key] === "object" && source[key] !== null) {
      if (!(key in target)) {
        Object.assign(output, { [key]: source[key] });
      } else {
        output[key] = deepMerge(target[key], source[key]);
      }
    } else {
      Object.assign(output, { [key]: source[key] });
    }
  });
  return output;
};

const loadConfigFromLocalStorage = () => {
  if (typeof window !== "undefined") {
    const storedConfigStr = localStorage.getItem("config");

    if (!storedConfigStr) {
      return DEFAULT_CONFIG;
    }

    try {
      const storedConfig = JSON.parse(storedConfigStr);

      if (storedConfig.version !== CONFIG_VERSION) {
        let migratedConfig = deepMerge(storedConfig, FORCE_CONFIG);
        migratedConfig = deepMerge(DEFAULT_CONFIG, migratedConfig);
        migratedConfig.version = CONFIG_VERSION;
        localStorage.setItem("config", JSON.stringify(migratedConfig));
        return migratedConfig;
      }

      return storedConfig;
    } catch (e) {
      console.error("Config load error", e);
      return DEFAULT_CONFIG;
    }
  }
  return DEFAULT_CONFIG;
};

const useConfigStore = create<ConfigStoreProps>((set) => ({
  config: loadConfigFromLocalStorage(),
  setConfig: (configUpdate) =>
    set((state) => {
      const newConfig =
        typeof configUpdate === "function"
          ? configUpdate(state.config)
          : deepMerge(state.config, configUpdate);
      if (typeof window !== "undefined") {
        localStorage.setItem("config", JSON.stringify(newConfig));
      }
      return { config: newConfig };
    }),
}));

export default useConfigStore;
