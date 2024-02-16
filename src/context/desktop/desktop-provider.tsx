import { PropsWithChildren, useState } from "react";
import { DesktopContext } from "./desktop-context";

export const DesktopProvider = ({ children }: PropsWithChildren) => {
  const [SearchBox, setSearchBox] = useState<boolean>(false);
  const [SearchInputMobile, setSearchInputModile] = useState<boolean>(false);
  const [QueueBox, setQueueBox] = useState<boolean>(false);
  const [QueueSelect, setQueueSelect] = useState<number | undefined>(undefined);

  return (
    <DesktopContext.Provider
      value={{
        setSearchBox,
        SearchBox,
        QueueBox,
        setQueueBox,
        SearchInputMobile,
        setSearchInputModile,
        QueueSelect,
        setQueueSelect,
      }}
    >
      {children}
    </DesktopContext.Provider>
  );
};
