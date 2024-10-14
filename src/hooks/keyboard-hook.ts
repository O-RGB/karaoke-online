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
    initializeKeyboardListeners,
    clearSearchingTimeout,
  } = useKeyboardStore();

  useEffect(() => {
    initializeKeyboardListeners();
    return () => {
      // ไม่ต้อง removeEventListener ที่นี่เพราะเราต้องการให้ listener ทำงานตลอดอายุของแอปพลิเคชัน
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
  };
};
