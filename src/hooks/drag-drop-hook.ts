import useDragDropStore from "@/components/stores/drag-drop-store";
import { useEffect } from "react";

export const useDragDrop = () => {
  const { isDragging, filesDragging, initializeDragDropListeners } =
    useDragDropStore();

  useEffect(() => {
    initializeDragDropListeners();
  }, [initializeDragDropListeners]);

  return { isDragging, filesDragging };
};
