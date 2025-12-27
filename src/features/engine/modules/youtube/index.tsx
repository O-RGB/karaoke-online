import React, { useEffect, useRef } from "react";
import YouTube, { YouTubePlayer } from "react-youtube";
import { useYoutubePlayer, isIOS } from "./youtube-player"; // อย่าลืม import isIOS

const YoutubeEngine: React.FC = () => {
  const {
    youtubeId,
    isPlay,
    show,
    hasUserUnmuted,
    showVolumeButton,
    setPlayer,
    setIsReady,
    setShowVolumeButton,
    setHasUserUnmuted,
    play, // fn จาก store (เปลี่ยน state isPlay=true)
    resolvePlaying,
    resetWaitPlaying,
  } = useYoutubePlayer();

  const currentVideoIdRef = useRef<string | undefined>("");

  const opts = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      modestbranding: 1,
      rel: 0,
      iv_load_policy: 3,
      mute: 1,
      playsinline: 1,
      fs: 0,
      enablejsapi: 1,
    },
  };

  const handleReady = (event: { target: YouTubePlayer }) => {
    const player = event.target;
    setPlayer(player);
    setIsReady(true);
    currentVideoIdRef.current = youtubeId;

    // Logic เริ่มต้น: ถ้าเป็น iOS ต้อง Mute เสมอ
    if (isIOS()) {
      player.mute();
      setHasUserUnmuted(false);
      setShowVolumeButton(true);
    } else {
      // Android / PC: ถ้าเคยเปิดเสียงแล้ว ให้เปิดต่อได้เลย
      if (show && hasUserUnmuted) {
        player.unMute();
        player.setVolume(100);
      } else {
        player.mute();
      }
    }

    player.pauseVideo();
  };

  const handleStateChange = (e: { data: number; target: YouTubePlayer }) => {
    const state = e.data;
    const player = e.target;
    const currentState = useYoutubePlayer.getState();

    if (state === 1) {
      // Playing
      resolvePlaying?.();
    } else if (state === 2) {
      // Paused
      resetWaitPlaying?.();

      // Auto-resume protection
      if (currentState.show && currentState.isPlay && !isIOS()) {
        console.log("Auto-resume trigger");
        player.playVideo();
      }
    } else if (state === 0) {
      // Ended
      resetWaitPlaying?.();
    } else if (state === -1 || state === 5) {
      // Android Fix: Unstarted/Cued
      if (currentState.show && currentState.isPlay && !isIOS()) {
        console.log("Force play trigger (Unstarted/Cued state)");
        player.playVideo();
      }
    }
  };

  // 1. จัดการการเปลี่ยน Video ID (หัวใจสำคัญ)
  useEffect(() => {
    const currentState = useYoutubePlayer.getState();
    const player = currentState.player;

    if (!player || !youtubeId) return;

    if (currentVideoIdRef.current !== youtubeId) {
      currentVideoIdRef.current = youtubeId;

      // --- กรณี iOS ---
      // บังคับ Reset ทุกรอบ ให้ปุ่มขึ้นใหม่เสมอ
      if (isIOS()) {
        console.log("iOS: Resetting for new video");
        setHasUserUnmuted(false);
        setShowVolumeButton(true);
        player.mute();
        player.loadVideoById({ videoId: youtubeId, startSeconds: 0 });
        player.pauseVideo(); // รอ User กดปุ่ม
        return;
      }

      // --- กรณี Android / Desktop ---
      if (hasUserUnmuted) {
        // โหลดและเล่นต่อทันที
        player.loadVideoById({ videoId: youtubeId, startSeconds: 0 });

        // 🔥 FIX ANDROID:
        // สั่ง play() ของ Store ทันที เพื่อให้ currentim / progress bar ทำงาน
        // ไม่ต้องรอ callback จาก YouTube State Change
        play();
        player.playVideo();
      } else {
        // ยังไม่เคยเปิดเสียง -> Mute แล้วเล่น (Autoplay แบบเงียบ)
        player.mute();
        player.loadVideoById({ videoId: youtubeId, startSeconds: 0 });

        // ถ้า Store บอกว่าเล่นอยู่ ก็สั่งเล่นต่อเลย
        if (currentState.isPlay) {
          play(); // ย้ำ State
          player.playVideo();
        }
      }
    }
  }, [youtubeId, hasUserUnmuted]);

  // 2. จัดการ Play/Pause/Show
  useEffect(() => {
    const player = useYoutubePlayer.getState().player;
    if (!player) return;

    try {
      const iframe = player.getIframe && player.getIframe();
      if (!iframe) return;
    } catch (err) {
      return;
    }

    if (!show) {
      player.pauseVideo();
      return;
    }

    if (isPlay) {
      // iOS ต้องผ่าน User Interaction เท่านั้นในรอบแรก
      if (isIOS() && !hasUserUnmuted) {
        return;
      }
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  }, [show, isPlay]);

  const handleToggleMute = () => {
    const player = useYoutubePlayer.getState().player;
    if (!player) return;

    setHasUserUnmuted(true);
    setShowVolumeButton(false);

    player.unMute();
    player.setVolume(100);

    play(); // สั่ง Store ให้ state = Playing -> currentim จะเริ่มวิ่ง
    player.playVideo();
  };

  return (
    <>
      <div
        className={`fixed inset-0 -z-10 overflow-hidden transition-opacity duration-500 ${
          show ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute top-1/2 left-1/2"
          style={{
            width: `${
              typeof window !== "undefined" ? window.innerHeight * (16 / 9) : 0
            }px`,
            height: `${
              typeof window !== "undefined" ? window.innerHeight : 0
            }px`,
            transform: "translate(-50%, -50%)",
            minWidth: "100vw",
            minHeight: "100vh",
          }}
        >
          <YouTube
            videoId={youtubeId}
            opts={{ ...opts, width: "100%", height: "100%" }}
            onReady={handleReady}
            onStateChange={handleStateChange}
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>
      </div>

      {/* ปุ่มเปิดเสียง (ปรับปรุงใหม่ Responsive) */}
      {showVolumeButton && show && (
        <button
          onClick={handleToggleMute}
          className="
            fixed z-50 
            top-1/2 left-1/2 
            -translate-x-1/2 -translate-y-1/2
            
            flex items-center justify-center gap-3
            
            /* Responsive Sizing */
            w-[80vw] max-w-[280px] md:w-auto md:max-w-none
            px-6 py-4 md:px-12 md:py-6
            
            bg-black/40 
            backdrop-blur-xl 
            border border-white/20
            rounded-2xl md:rounded-full
            shadow-[0_8px_32px_rgba(0,0,0,0.3)]
            
            text-white font-bold tracking-wide
            cursor-pointer
            
            transition-all duration-300 ease-out
            hover:scale-105 active:scale-95
          "
        >
          {/* Icon size responsive */}
          <span className="text-2xl md:text-3xl">🔊</span>

          {/* Text size responsive */}
          <span className="text-lg md:text-2xl whitespace-nowrap">
            {isIOS() ? "แตะเพื่อเล่น" : "แตะเพื่อเปิดเสียง"}
          </span>
        </button>
      )}
    </>
  );
};

export default YoutubeEngine;
