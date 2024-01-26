import { PropsWithChildren, useState } from "react";
import { LoadFileContext } from "./test-load-file-context";

export const LoadFileProvider = ({ children }: PropsWithChildren) => {
  const [Folder, setFolder] = useState<Folder | undefined>(undefined);

  return (
    <LoadFileContext.Provider value={{ Folder, setFolder }}>
      {children}
    </LoadFileContext.Provider>
  );
};
