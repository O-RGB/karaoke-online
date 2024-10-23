import { create } from "zustand";

type KeyboardState = {
  lastKey: string | null;
  searching: string;
  queueing: boolean;
  onEnter: boolean;
  arrowDown: boolean;
  arrowUp: boolean;
  arrowLeft: boolean;
  arrowRight: boolean;
  setLastKey: (key: string | null) => void;
  setSearching: (value: string) => void;
  setEnter: (value: boolean) => void;
  setArrowDown: (value: boolean) => void;
  setArrowUp: (value: boolean) => void;
  setArrowLeft: (value: boolean) => void;
  setArrowRight: (value: boolean) => void;
  handleKeyUp: (event: KeyboardEvent) => void;
  initializeKeyboardListeners: () => void;
  clearSearchingTimeout: () => void;
  setQueueOpen?: () => void;
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
      set({ searching: "" });
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

  const setQueueOpen = () => {
    set({ queueing: true });
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    console.log("keyup zustated");
    const { key } = event;
    set((state) => {
      let newState = { ...state };

      if (/^[a-zA-Zก-๙0-9\s]$/.test(key)) {
        newState.lastKey = key;
        newState.searching += key;
        newState.queueing = false;
        resetSearchingTimeout();
      } else if (key === "Backspace") {
        newState.searching = state.searching.slice(0, -1);
        newState.queueing = false;
        resetSearchingTimeout();
      } else if (key === "Enter") {
        newState.onEnter = !state.onEnter;
        newState.searching = "";
        newState.queueing = false;
        clearSearchingTimeout();
      } else if (key === "ArrowDown") {
        newState.arrowDown = !state.arrowDown;
        newState.queueing = true;
        resetQueueingTimeout();
      } else if (key === "ArrowUp") {
        newState.arrowUp = !state.arrowUp;
        newState.queueing = true;
        resetQueueingTimeout();
      } else if (key === "ArrowLeft") {
        newState.arrowLeft = !state.arrowLeft;
        newState.queueing = false;
        resetSearchingTimeout();
      } else if (key === "ArrowRight") {
        newState.arrowRight = !state.arrowRight;
        newState.queueing = false;
        resetSearchingTimeout();
      } else {
        newState.lastKey = null;
      }

      return newState;
    });
  };

  const initializeKeyboardListeners = () => {
    if (!isListenerInitialized) {
      window.addEventListener("keyup", handleKeyUp);
      isListenerInitialized = true;
    }
  };

  return {
    lastKey: null,
    searching: "",
    queueing: false,
    onEnter: false,
    arrowDown: false,
    arrowUp: false,
    arrowLeft: false,
    arrowRight: false,
    setLastKey: (key) => set({ lastKey: key }),
    setSearching: (value) => {
      set({ searching: value });
      resetSearchingTimeout();
    },
    setEnter: (value) => set({ onEnter: value }),
    setArrowDown: (value) => set({ arrowDown: value }),
    setArrowUp: (value) => set({ arrowUp: value }),
    setArrowLeft: (value) => set({ arrowLeft: value }),
    setArrowRight: (value) => set({ arrowRight: value }),
    handleKeyUp,
    initializeKeyboardListeners,
    clearSearchingTimeout,
    resetQueueingTimeout,
    resetSearchingTimeout,
    setQueueOpen,
  };
});

export default useKeyboardStore;
