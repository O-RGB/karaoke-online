import { create } from "zustand";
interface MixerStore {
  hideMixer: boolean;
  setHideMixer: (isHide: boolean) => void;
}

const useMixerStoreNew = create<MixerStore>((set, get) => ({
  hideMixer: true,
  setHideMixer: (hideMixer) =>
    set((state) => ({
      hideMixer,
    })),
}));

export default useMixerStoreNew;
