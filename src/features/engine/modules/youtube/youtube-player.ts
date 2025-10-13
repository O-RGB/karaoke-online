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
  waitUntilPlaying: () => Promise<void>;
  resetWaitPlaying: () => void;
  // --- Controls ---
  play: () => void;
  pause: () => void;
  stop: () => void;
  seekTo: (seconds: number) => void;
  mute: () => void;
  unmute: () => void;
  loadVideo: (id: string) => void;
}

export const useYoutubePlayer = create<IYoutubePlayer>((set, get) => {
  let playingResolvers: (() => void)[] = [];

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

    // ✅ รอจน YouTube state === 1 (ทุกครั้ง)
    waitUntilPlaying: () => {
      return new Promise<void>((resolve) => {
        const p = get().player;
        if (!p) return resolve();
        const s = p.getPlayerState?.();
        if (s === 1) return resolve(); // already playing

        playingResolvers.push(resolve);
      });
    },

    // 🔁 เรียกเมื่อ state = 1
    resolvePlaying: () => {
      playingResolvers.forEach((r) => r());
      playingResolvers = [];
    },

    // 🔄 เรียกตอน pause เพื่อ reset queue
    resetWaitPlaying: () => {
      playingResolvers = [];
    },
  };
});
