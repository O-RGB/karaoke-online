import { create } from "zustand";

interface ProgressStore {
    progress: IProgressBar | undefined;
    abortController: AbortController | undefined
    setAbortController: (controller: AbortController | undefined) => void
    setProgress: (progress: IProgressBar | undefined) => void;
    close: () => void
}

const useProgressStore = create<ProgressStore>((set, get) => ({
    progress: undefined,
    abortController: undefined,
    setAbortController: (controller) => set({ abortController: controller }),
    setProgress: (progress: IProgressBar | undefined) => set({ progress }),
    close: () => {
        get().abortController?.abort();
        set((state) => ({
            progress: undefined,
            abortController: undefined
        }))
    }
}));

export default useProgressStore;
