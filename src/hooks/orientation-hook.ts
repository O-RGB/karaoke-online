import { useEffect } from "react";
import useOrientationStore from "@/features/orientation-store";

export const useOrientation = () => {
  const {
    orientation,
    isMobile,
    windowsWidth,
    initializeOrientationListeners,
  } = useOrientationStore();

  useEffect(() => {
    const cleanup = initializeOrientationListeners();
    return cleanup;
  }, [initializeOrientationListeners]);

  return {
    orientation,
    isMobile,
    windowsWidth,
  };
};
