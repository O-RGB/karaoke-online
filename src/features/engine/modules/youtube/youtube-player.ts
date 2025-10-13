import { create } from "zustand";
import type { YouTubePlayer } from "react-youtube";

export interface IYoutubePlayer {
  show?: boolean;
  youtubeId?: string;
  isPlay?: boolean;
  isReady?: boolean;
  player?: YouTubePlayer | null;
  hasUserUnmuted?: boolean;
  showVolumeButton?: boolean;

  // --- Setters ---
  setPause: (play: boolean) => void;
  setIsReady: (ok: boolean) => void;
  setYoutubeId: (id?: string) => void;
  setShow: (isShow: boolean) => void;
  setPlayer: (p: YouTubePlayer | null) => void;
  setHasUserUnmuted: (v: boolean) => void;
  setShowVolumeButton: (v: boolean) => void;
  resolvePlaying: () => void;

  // --- Controls ---
  play: () => void;
  pause: () => void;
  stop: () => void;
  seekTo: (seconds: number) => void;
  mute: () => void;
  unmute: () => void;
  loadVideo: (id: string) => void;
}
export const useYoutubePlayer = create<
  IYoutubePlayer & {
    waitUntilPlaying: () => Promise<void>;
  }
>((set, get) => {
  let playingResolver: (() => void) | null = null;

  return {
    youtubeId: undefined,
    isPlay: false,
    isReady: false,
    show: false,
    player: null,
    hasUserUnmuted: false,
    showVolumeButton: true,

    setPause: (play) => set({ isPlay: play }),
    setIsReady: (ok) => set({ isReady: ok }),
    setYoutubeId: (id) => set({ youtubeId: id }),
    setShow: (isShow) => set({ show: isShow }),
    setPlayer: (p) => set({ player: p }),
    setHasUserUnmuted: (v) => set({ hasUserUnmuted: v }),
    setShowVolumeButton: (v) => set({ showVolumeButton: v }),

    // ---- Control actions ----
    play: () => {
      const p = get().player;
      if (p) p.playVideo();
      set({ isPlay: true });
    },
    pause: () => {
      const p = get().player;
      if (p) p.pauseVideo();
      set({ isPlay: false });
    },
    stop: () => {
      const p = get().player;
      if (p) p.stopVideo();
      set({ isPlay: false });
    },
    seekTo: (sec) => {
      const p = get().player;
      if (p) p.seekTo(sec, true);
    },
    mute: () => {
      const p = get().player;
      if (p) p.mute();
    },
    unmute: () => {
      const p = get().player;
      if (p) {
        p.unMute();
        p.setVolume(100);
      }
    },
    loadVideo: (id) => {
      const p = get().player;
      if (!p) return;
      p.loadVideoById({ videoId: id, startSeconds: 0 });
      set({ youtubeId: id });
    },

    // --- รอจนกว่า YouTube จะเล่นจริง ๆ ---
    waitUntilPlaying: () => {
      return new Promise<void>((resolve) => {
        const player = get().player;
        if (!player) return resolve();

        const state = player.getPlayerState?.();
        if (state === 1) return resolve(); // already playing

        playingResolver = resolve;
      });
    },

    // internal helper: เรียกตอน YouTube เปลี่ยน state
    resolvePlaying: () => {
      if (playingResolver) {
        playingResolver();
        playingResolver = null;
      }
    },
  };
});
