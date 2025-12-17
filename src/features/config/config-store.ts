import { DEFAULT_CONFIG } from "@/config/value";
import { create } from "zustand";
import { ConfigStoreProps } from "./types/config.type";

const loadConfigFromLocalStorage = () => {
  if (typeof window !== "undefined") {
    const storedConfig = localStorage.getItem("config");
    return storedConfig ? JSON.parse(storedConfig) : DEFAULT_CONFIG;
  }
  return DEFAULT_CONFIG;
};

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
