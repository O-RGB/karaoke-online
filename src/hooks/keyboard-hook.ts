import useKeyboardStore from "@/features/keyboard-state";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

export const useKeyboardListener = () => {
  const initialize = useKeyboardStore(
    (state) => state.initializeKeyboardListeners
  );

  useEffect(() => {
    initialize();
  }, [initialize]);
};

export const useKeyboardSearch = () => {
  return useKeyboardStore(
    useShallow((state) => ({
      searching: state.searching,
      openSearchBox: state.openSearchBox,
      setOpenSearchBox: state.setOpenSearchBox,
    }))
  );
};

export const useKeyboardNavigation = () => {
  return useKeyboardStore(
    useShallow((state) => ({
      arrowUp: state.arrowUp,
      arrowDown: state.arrowDown,
      arrowLeft: state.arrowLeft,
      arrowRight: state.arrowRight,
      onEnter: state.onEnter,
      queueing: state.queueing,
      setQueueOpen: state.setQueueOpen,
    }))
  );
};

export const useKeyboardControls = () => {
  return useKeyboardStore(
    useShallow((state) => ({
      paused: state.paused,
      setPaused: state.setPaused,
    }))
  );
};
