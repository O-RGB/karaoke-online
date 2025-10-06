import { create } from "zustand";

export interface IYoutubePlayer {
  show?: boolean;
  youtubeId?: string;
  isPlay?: boolean;
  isReady?: boolean;
  setPause: (play: boolean) => void;
  setIsReady: (ok: boolean) => void;
  setYoutubeId: (id?: string) => void;
  setShow: (isShow: boolean) => void;
}
export const useYoutubePlayer = create<IYoutubePlayer>((set, get) => ({
  youtubeId: undefined,
  isPlay: false,
  setPause: (play) => {
    set({ isPlay: play });
  },
  setIsReady: (ok: boolean) => {
    set({ isReady: ok });
  },
  setYoutubeId: (id?: string) => {
    set({ youtubeId: id });
  },
  setShow: (isShow: boolean) => {
    set({ show: isShow });
  },
}));
