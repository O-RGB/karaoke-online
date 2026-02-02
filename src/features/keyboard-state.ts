import { create } from "zustand";

type KeyboardState = {
  // State
  lastKey: string | null;
  openSearchBox: boolean;
  searching: string;
  queueing: boolean;
  onEnter: number;
  arrowDown: number;
  arrowUp: number;
  arrowLeft: number;
  arrowRight: number;
  paused: boolean;

  // Actions
  setPaused: (value: boolean) => void;
  setLastKey: (key: string | null) => void;
  setSearching: (value: string) => void;
  setEnter: (value: number) => void;
  setArrowDown: (value: number) => void;
  setArrowUp: (value: number) => void;
  setArrowLeft: (value: number) => void;
  setArrowRight: (value: number) => void;
  handleKeyUp: (event: KeyboardEvent) => void;
  initializeKeyboardListeners: () => void;

  // Timeout Controls
  clearSearchingTimeout: () => void;
  setQueueOpen: () => void;
  setOpenSearchBox: (open: boolean) => void;
  resetQueueingTimeout: (time?: number) => void;
  resetSearchingTimeout: (time?: number) => void;
};

const useKeyboardStore = create<KeyboardState>((set, get) => {
  let searchingTimeout: NodeJS.Timeout | null = null;
  let queueingTimeout: NodeJS.Timeout | null = null;
  let isListenerInitialized = false;

  const clearSearchingTimeout = () => {
    if (searchingTimeout) {
      clearTimeout(searchingTimeout);
      searchingTimeout = null;
    }
  };

  const resetSearchingTimeout = (time = 10000) => {
    clearSearchingTimeout();
    searchingTimeout = setTimeout(() => {
      set({ searching: "", openSearchBox: false });
    }, time);
  };

  const clearQueueingTimeout = () => {
    if (queueingTimeout) {
      clearTimeout(queueingTimeout);
      queueingTimeout = null;
    }
  };

  const resetQueueingTimeout = (time = 5000) => {
    clearQueueingTimeout();
    queueingTimeout = setTimeout(() => {
      set({ queueing: false });
    }, time);
  };

  return {
    lastKey: null,
    searching: "",
    openSearchBox: false,
    queueing: false,
    onEnter: 0,
    arrowDown: 0,
    arrowUp: 0,
    arrowLeft: 0,
    arrowRight: 0,
    paused: false,

    setPaused: (value) => set({ paused: value }),
    setLastKey: (key) => set({ lastKey: key }),
    setSearching: (value) => {
      set({ searching: value, queueing: false });
      resetSearchingTimeout();
    },
    setEnter: (value) => set({ onEnter: value }),
    setArrowDown: (value) => set({ arrowDown: value }),
    setArrowUp: (value) => set({ arrowUp: value }),
    setArrowLeft: (value) => set({ arrowLeft: value }),
    setArrowRight: (value) => set({ arrowRight: value }),

    clearSearchingTimeout,
    resetQueueingTimeout,
    resetSearchingTimeout,

    setQueueOpen: () => {
      set({ queueing: true, searching: "", openSearchBox: false });
    },

    setOpenSearchBox: (open: boolean) => {
      set({ openSearchBox: open });
      if (open) {
        resetSearchingTimeout();
      } else {
        clearSearchingTimeout();
      }
    },

    handleKeyUp: (event: KeyboardEvent) => {
      const state = get();
      if (state.paused) return;

      const { key } = event;

      // ใช้ Partial Update แทนการ Clone State ทั้งหมด
      if (/^[a-zA-Zก-๙0-9\s]$/.test(key)) {
        resetSearchingTimeout();
        set((prev) => ({
          queueing: false,
          searching: prev.searching + key,
        }));
      } else if (key === "Backspace") {
        clearQueueingTimeout();
        set((prev) => ({
          queueing: false,
          searching: prev.searching.slice(0, -1),
        }));
      } else if (key === "Enter") {
        clearSearchingTimeout();
        clearQueueingTimeout();
        set((prev) => ({
          onEnter: prev.onEnter + 1,
          searching: "",
        }));
      } else if (key === "ArrowDown") {
        clearSearchingTimeout();
        resetQueueingTimeout();
        set((prev) => ({
          arrowDown: prev.arrowDown + 1,
          searching: "",
          queueing: true,
        }));
      } else if (key === "ArrowUp") {
        clearSearchingTimeout();
        resetQueueingTimeout();
        set((prev) => ({
          arrowUp: prev.arrowUp + 1,
          searching: "",
          queueing: true,
        }));
      } else if (key === "ArrowLeft") {
        resetSearchingTimeout();
        set((prev) => ({
          arrowLeft: prev.arrowLeft + 1,
        }));
      } else if (key === "ArrowRight") {
        resetSearchingTimeout();
        set((prev) => ({
          arrowRight: prev.arrowRight + 1,
        }));
      } else {
        set({ lastKey: null });
      }
    },

    initializeKeyboardListeners: () => {
      if (!isListenerInitialized) {
        window.addEventListener("keyup", (e) => get().handleKeyUp(e));
        isListenerInitialized = true;
      }
    },
  };
});

export default useKeyboardStore;
