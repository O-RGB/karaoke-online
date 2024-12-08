import { DEFAULT_CONFIG } from "@/config/value";
import { crendentialKeys } from "./local-storage";
import { ConfigDisplay } from "@/stores/config/types/config.type";

export const setupLocalConfig = async () => {
  const config = getLocalConfig();
  if (config) {
    return config;
  } else {
    const res = setLocalConfig(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }
};

export const setLocalConfig = (config: ConfigDisplay) => {
  localStorage.setItem(crendentialKeys.config, JSON.stringify(config));
  return true;
};

export const getLocalConfig = (): ConfigDisplay | undefined => {
  const local = localStorage.getItem(crendentialKeys.config) || null;
  try {
    if (local) {
      let toJson = JSON.parse(local);
      let config: ConfigDisplay = {
        ...(toJson as any),
      };

      return config;
    }
  } catch (error) {
    return undefined;
  }
};

export const appendLocalConfig = (config: Partial<ConfigDisplay>) => {
  let system_config = getLocalConfig() ?? DEFAULT_CONFIG;
  system_config = {
    ...system_config,
    ...config,
    lyrics: { ...system_config.lyrics, ...config.lyrics },
    widgets: { ...system_config.widgets, ...config.widgets },
    themes: { ...system_config.themes, ...config.themes },
    system: { ...system_config.system, ...config.system },
  };
  setLocalConfig(system_config);
};
