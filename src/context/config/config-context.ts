import React from "react";

export interface ConfigHook {
  ApiServer: string | undefined;
  setApiServer: (url: string) => void;
  setAPI: (input: string) => void;
}

export const ConfigContext = React.createContext<ConfigHook>({
  ApiServer: undefined,
  setApiServer: (url: string) => {},
  setAPI: (input: string) => {},
});
