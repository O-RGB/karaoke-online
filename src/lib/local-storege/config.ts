import { DEFAULT_CONFIG } from "@/config/value";
import { crendentialKeys } from "./local-storage";
import { ConfigSystem } from "@/features/config/types/config.type";

export const setupLocalConfig = async () => {
  const config = getLocalConfig();
  if (config) {
    return config;
  } else {
    const res = setLocalConfig(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }
};

export const setLocalConfig = (config: ConfigSystem) => {
  localStorage.setItem(crendentialKeys.config, JSON.stringify(config));
  return true;
};

export const getLocalConfig = (): ConfigSystem | undefined => {
  const local = localStorage.getItem(crendentialKeys.config) || null;
  try {
    if (local) {
      let toJson = JSON.parse(local);
      let config: ConfigSystem = {
        ...(toJson as any),
      };

      return config;
    }
  } catch (error) {
    return undefined;
  }
};

export const appendLocalConfig = (config: Partial<ConfigSystem>) => {
  let system_config = getLocalConfig() ?? DEFAULT_CONFIG;
  system_config = {
    ...system_config,
    ...config,
    lyrics: { ...system_config.lyrics, ...config.lyrics },
    widgets: { ...system_config.widgets, ...config.widgets },
    themes: { ...system_config.themes, ...config.themes },
    system: { ...system_config.system, ...config.system },
    token: config.token,
  };
  setLocalConfig(system_config);
};
