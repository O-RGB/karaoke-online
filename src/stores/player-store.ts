import { create } from "zustand";

interface VolumeStore {}

const useVolumeStore = create<VolumeStore>((set) => ({}));

export default useVolumeStore;
