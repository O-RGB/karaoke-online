import React from "react";

export interface DesktopHook {
  SearchBox: boolean | undefined;
  setSearchBox: (open: boolean) => void;
  QueueBox: boolean | undefined;
  setQueueBox: (open: boolean) => void;
}

export const DesktopContext = React.createContext<DesktopHook>({
  SearchBox: false,
  setSearchBox: (open: boolean) => {},
  QueueBox: false,
  setQueueBox: (open: boolean) => {},
});