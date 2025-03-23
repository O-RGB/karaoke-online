import { create } from "zustand";

type DragDropState = {
  isDragging: boolean;
  filesDragging: FileList | undefined;
  setIsDragging: (isDragging: boolean) => void;
  setFilesDragging: (files: FileList | undefined) => void;
  initializeDragDropListeners: () => void;
};

const useDragDropStore = create<DragDropState>((set) => {
  let isListenerInitialized = false;

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    set({ isDragging: true });
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    set({ isDragging: false });

    const files = e.dataTransfer?.files;
    if (files) {
      set({ filesDragging: files });
    }
  };

  return {
    isDragging: false,
    filesDragging: undefined,
    setIsDragging: (isDragging) => set({ isDragging }),
    setFilesDragging: (files) => set({ filesDragging: files }),
    initializeDragDropListeners: () => {
      if (!isListenerInitialized) {
        window.addEventListener("dragenter", handleDragEnter);
        window.addEventListener("dragover", handleDragOver);
        window.addEventListener("drop", handleDrop);
        isListenerInitialized = true;
      }
    },
  };
});

export default useDragDropStore;
