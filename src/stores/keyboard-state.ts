import { create } from "zustand";

type KeyboardState = {
  lastKey: string | null;
  searching: string;
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
};

const useKeyboardStore = create<KeyboardState>((set, get) => {
  let searchingTimeout: NodeJS.Timeout | null = null;
  let isListenerInitialized = false;

  const clearSearchingTimeout = () => {
    if (searchingTimeout) {
      clearTimeout(searchingTimeout);
      searchingTimeout = null;
    }
  };

  const resetSearchingTimeout = () => {
    clearSearchingTimeout();
    searchingTimeout = setTimeout(() => {
      set({ searching: "" });
    }, 10000);
  };

  const handleKeyUp = (event: KeyboardEvent) => {

    console.log("keyup zustated")
    const { key } = event;
    set((state) => {
      let newState = { ...state };

      if (/^[a-zA-Zก-๙0-9\s]$/.test(key)) {
        newState.lastKey = key;
        newState.searching += key;
        resetSearchingTimeout();
      } else if (key === "Backspace") {
        newState.searching = state.searching.slice(0, -1);
        resetSearchingTimeout();
      } else if (key === "Enter") {
        newState.onEnter = !state.onEnter;
        newState.searching = "";
        clearSearchingTimeout();
      } else if (key === "ArrowDown") {
        newState.arrowDown = !state.arrowDown;
      } else if (key === "ArrowUp") {
        newState.arrowUp = !state.arrowUp;
      } else if (key === "ArrowLeft") {
        newState.arrowLeft = !state.arrowLeft;
        resetSearchingTimeout();
      } else if (key === "ArrowRight") {
        newState.arrowRight = !state.arrowRight;
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
  };
});

export default useKeyboardStore;
