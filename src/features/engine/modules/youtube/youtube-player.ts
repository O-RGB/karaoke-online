import { YouTubePlayer } from "react-youtube";
import { create } from "zustand";

// ฟังก์ชันเช็คว่าเป็น iOS หรือไม่ (iPhone, iPad, iPod)
const isIOS = () => {
  if (typeof window === "undefined" || typeof navigator === "undefined")
    return false;

  const isMobileIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isIpadOS =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  return isMobileIOS || isIpadOS;
};

export interface IYoutubePlayer {
  show?: boolean;
  youtubeId?: string;
  isPlay?: boolean;
  isReady?: boolean;
  player?: YouTubePlayer;
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
      if (p) {
        // [FIX] แก้ไขเฉพาะ iOS: ต้อง Mute ก่อนเล่นเสมอ เพื่อให้ Auto Play ทำงานได้
        if (isIOS()) {
          // ถ้าเป็น iOS และยังไม่ได้ Mute ให้ Mute ก่อน
          if (typeof p.isMuted === "function" && !p.isMuted()) {
            p.mute();
          }
          p.playVideo();
        } else {
          // [ANDROID/PC] ทำงานปกติ เล่นได้เลย
          p.playVideo();
        }
      }
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
      // startSeconds: 0 จะช่วยให้เริ่มเล่นใหม่เสมอ
      p.loadVideoById({ videoId: id, startSeconds: 0 });
      set({ youtubeId: id });
    },

    waitUntilPlaying: () => {
      return new Promise<void>((resolve) => {
        const p = get().player;
        if (!p) return resolve();
        const s = p.getPlayerState?.();
        if (s === 1) return resolve();

        playingResolvers.push(resolve);
      });
    },

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
