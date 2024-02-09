import { PropsWithChildren, useState } from "react";
import { ConfigContext } from "./config-context";

export const ConfigProvider = ({ children }: PropsWithChildren) => {
  const [ApiServer, setApiServer] = useState<string | undefined>(undefined);

  const setAPI = (input: string) => {
    console.log("test set api");
    setApiServer(input);
  };

  return (
    <ConfigContext.Provider
      value={{
        ApiServer,
        setApiServer,
        setAPI,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};
