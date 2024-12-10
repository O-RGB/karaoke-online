import { create } from "zustand";
import useMixerStoreNew from "./player/event-player/modules/event-mixer-store";

type Orientation = "landscape" | "portrait" | null;

interface OrientationState {
  orientation: Orientation;
  isMobile: boolean;
  setOrientation: (newOrientation: Orientation) => void;
  setIsMobile: (isMobile: boolean) => void;
  checkIsMobile: () => void;
  handleResize: () => void;
  initializeOrientationListeners: () => void;
}

const useOrientationStore = create<OrientationState>((set, get) => ({
  orientation: null,
  isMobile: false,
  setOrientation: (newOrientation) => set({ orientation: newOrientation }),
  setIsMobile: (isMobile) => set({ isMobile }),
  checkIsMobile: () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileDevices =
      /iphone|ipad|ipod|android|blackberry|iemobile|opera mini|mobile/;
    set({ isMobile: mobileDevices.test(userAgent) });
  },
  handleResize: () => {
    const { isMobile } = get();
    if (isMobile) {
      const newOrientation =
        window.innerWidth > window.innerHeight ? "landscape" : "portrait";
      set({ orientation: newOrientation });
      if (newOrientation === "landscape") {
        useMixerStoreNew.getState().setHideMixer(true);
      }
    } else {
      set({ orientation: null });
    }
  },
  initializeOrientationListeners: () => {
    const { checkIsMobile, handleResize } = get();
    checkIsMobile();
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  },
}));

export default useOrientationStore;
