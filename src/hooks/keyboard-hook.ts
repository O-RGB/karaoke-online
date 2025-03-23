import useKeyboardStore from "@/features/keyboard-state";
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
  } = useKeyboardStore();

  useEffect(() => {
    initializeKeyboardListeners();
  }, [initializeKeyboardListeners]);

  return {
    lastKey,
    searching,
    onEnter,
    arrowDown,
    arrowUp,
    arrowLeft,
    arrowRight,
    queueing,
    setQueueOpen,
  };
};
