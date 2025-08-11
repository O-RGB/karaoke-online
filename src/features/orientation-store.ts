import { create } from "zustand";

type Orientation = "landscape" | "portrait" | null;

interface OrientationState {
  orientation: Orientation;
  isMobile: boolean;
  windowsWidth?: number;
  setOrientation: (newOrientation: Orientation) => void;
  setIsMobile: (isMobile: boolean) => void;
  detectDeviceType: () => void;
  detectOrientation: () => void;
  initializeOrientationListeners: () => () => void;
}

const useOrientationStore = create<OrientationState>((set, get) => ({
  orientation: null,
  isMobile: false,
  windowsWidth: 0,

  setOrientation: (newOrientation) => set({ orientation: newOrientation }),
  setIsMobile: (isMobile) => set({ isMobile }),

  detectDeviceType: () => {
    const mobileUA =
      /iphone|ipad|ipod|android|blackberry|iemobile|opera mini|mobile/i;
    const isMobileUA = mobileUA.test(navigator.userAgent);

    const isSmallScreen = window.matchMedia("(max-width: 1024px)").matches;

    set({ isMobile: isMobileUA || isSmallScreen });
  },

  detectOrientation: () => {
    let newOrientation: Orientation;

    if (window.matchMedia?.("(orientation: portrait)").matches) {
      newOrientation = "portrait";
    } else if (window.matchMedia?.("(orientation: landscape)").matches) {
      newOrientation = "landscape";
    } else {
      newOrientation =
        window.innerWidth > window.innerHeight ? "landscape" : "portrait";
    }

    set({
      orientation: newOrientation,
      windowsWidth: window.innerWidth,
    });
  },

  initializeOrientationListeners: () => {
    const { detectDeviceType, detectOrientation } = get();

    detectDeviceType();
    detectOrientation();

    const handleChange = () => {
      detectDeviceType();
      detectOrientation();
    };

    window.addEventListener("resize", handleChange);
    window.addEventListener("orientationchange", handleChange);

    return () => {
      window.removeEventListener("resize", handleChange);
      window.removeEventListener("orientationchange", handleChange);
    };
  },
}));

export default useOrientationStore;
