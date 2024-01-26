import React from "react";

export interface LoadFileHook {
  Folder: Folder | undefined;
  setFolder: (Folder: Folder) => unknown;
}

export const LoadFileContext = React.createContext<LoadFileHook>({
  Folder: undefined,
  setFolder: () => {},
});
