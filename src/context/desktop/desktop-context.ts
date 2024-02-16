import React from "react";

export interface DesktopHook {
  SearchBox: boolean | undefined;
  setSearchBox: (open: boolean) => void;
  QueueBox: boolean | undefined;
  setQueueBox: (open: boolean) => void;
  SearchInputMobile: boolean | undefined;
  setSearchInputModile: (open: boolean) => void;
  QueueSelect: number | undefined;
  setQueueSelect: (index: number) => void;
}




export const DesktopContext = React.createContext<DesktopHook>({
  SearchBox: false,
  setSearchBox: () => {},
  QueueBox: false,
  setQueueBox: () => {},
  SearchInputMobile: false,
  setSearchInputModile: () => {},
  QueueSelect: undefined,
  setQueueSelect: () => {},
});
