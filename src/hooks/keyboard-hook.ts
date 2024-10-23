import useKeyboardStore from "@/stores/keyboard-state";
import { useEffect } from "react";

export const useKeyboardEvents = () => {
  const {
    lastKey,
    searching,
    onEnter,
    arrowDown,
    arrowUp,
    arrowLeft,
    arrowRight,
    queueing,
    setQueueOpen,
    initializeKeyboardListeners,
    clearSearchingTimeout,
    resetQueueingTimeout,
    resetSearchingTimeout,
  } = useKeyboardStore();

  useEffect(() => {
    initializeKeyboardListeners();
    return () => {
      clearSearchingTimeout();
    };
  }, [initializeKeyboardListeners, clearSearchingTimeout]);

  return {
    lastKey,
    searching,
    onEnter,
    arrowDown,
    arrowUp,
    arrowLeft,
    arrowRight,
    queueing,
    resetQueueingTimeout,
    resetSearchingTimeout,
    setQueueOpen
  };
};
