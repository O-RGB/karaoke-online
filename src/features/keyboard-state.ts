import { create } from "zustand";

type KeyboardState = {
  lastKey: string | null;
  openSearchBox: boolean;
  searching: string;
  queueing: boolean;
  onEnter: number;
  arrowDown: number;
  arrowUp: number;
  arrowLeft: number;
  arrowRight: number;
  setLastKey: (key: string | null) => void;
  setSearching: (value: string) => void;
  setEnter: (value: number) => void;
  setArrowDown: (value: number) => void;
  setArrowUp: (value: number) => void;
  setArrowLeft: (value: number) => void;
  setArrowRight: (value: number) => void;
  handleKeyUp: (event: KeyboardEvent) => void;
  initializeKeyboardListeners: () => void;
  clearSearchingTimeout: () => void;
  setQueueOpen?: () => void;
  setOpenSearchBox?: (open: boolean) => void
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

  const setQueueOpen = () => {
    set({ queueing: true, searching: "", openSearchBox: false });
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    const { key } = event;

    set((state) => {
      let newState = { ...state };

      if (/^[a-zA-Zก-๙0-9\s]$/.test(key)) {
        newState.queueing = false;
        resetSearchingTimeout();
        newState.searching += key;
      } else if (key === "Backspace") {
        clearQueueingTimeout();
        queueingTimeout = null;
        newState.searching = state.searching.slice(0, -1);
        newState.queueing = false;
      } else if (key === "Enter") {
        clearSearchingTimeout();
        clearQueueingTimeout();
        queueingTimeout = null;
        newState.onEnter = newState.onEnter + 1;
        newState.searching = "";
      } else if (key === "ArrowDown" || key === "ArrowUp") {
        if (key === "ArrowDown") newState.arrowDown = newState.arrowDown + 1;
        if (key === "ArrowUp") newState.arrowUp = newState.arrowUp + 1;
        clearSearchingTimeout();
        newState.searching = "";
        searchingTimeout = null;
        newState.queueing = true;
        resetQueueingTimeout();
      } else if (key === "ArrowLeft") {
        queueingTimeout = null;
        newState.arrowLeft = newState.arrowLeft + 1;
        resetSearchingTimeout();
      } else if (key === "ArrowRight") {
        resetSearchingTimeout();
        queueingTimeout = null;
        newState.arrowRight = newState.arrowRight + 1;
      } else {
        newState.lastKey = null;
      }

      return newState;
    });
  };

  const setOpenSearchBox = (open: boolean) => {
    set({ openSearchBox: open })
    if (open) {
      resetSearchingTimeout();
    } else {
      clearSearchingTimeout();
    }
  }

  const initializeKeyboardListeners = () => {
    if (!isListenerInitialized) {
      window.addEventListener("keyup", handleKeyUp);
      isListenerInitialized = true;
    }
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
    handleKeyUp,
    initializeKeyboardListeners,
    clearSearchingTimeout,
    resetQueueingTimeout,
    resetSearchingTimeout,
    setQueueOpen,
    setOpenSearchBox
  };
});

export default useKeyboardStore;
