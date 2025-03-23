import useDragDropStore from "@/features/drag-drop-store";
import { useEffect } from "react";

export const useDragDrop = () => {
  const { isDragging, filesDragging, initializeDragDropListeners } =
    useDragDropStore();

  useEffect(() => {
    initializeDragDropListeners();
  }, [initializeDragDropListeners]);

  return { isDragging, filesDragging };
};
