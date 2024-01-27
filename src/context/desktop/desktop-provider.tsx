import { PropsWithChildren, useState } from "react";
import { DesktopContext } from "./desktop-context";

export const DesktopProvider = ({ children }: PropsWithChildren) => {
  const [SearchBox, setSearchBox] = useState<boolean>(false);
  const [QueueBox, setQueueBox] = useState<boolean>(false);
  return (
    <DesktopContext.Provider
      value={{ setSearchBox, SearchBox, QueueBox, setQueueBox }}
    >
      {children}
    </DesktopContext.Provider>
  );
};
