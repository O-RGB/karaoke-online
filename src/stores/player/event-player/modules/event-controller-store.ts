import { VOLUME_DEFAULT } from "@/config/value";
import { create } from "zustand";
// onVolumeMeterChange
// onPenChange
// onPitchChange
// onMutedVolume
// onLockedVolume
// onPersetChange
// onReverbChange
// onChorusDepthChange
interface MixerStore {
  volumes: number[];
  setVolumes: (volume: number[] | ((prev: number[]) => number[])) => void;
}

const useControllerStore = create<MixerStore>((set, get) => ({
  volumes: VOLUME_DEFAULT,
  setVolumes: (volume) =>
    set((state) => ({
      volumes: typeof volume === "function" ? volume(state.volumes) : volume,
    })),
}));

export default useControllerStore;
