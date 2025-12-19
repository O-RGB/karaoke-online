// src/features/engine/modules/youtube/index.tsx

import React, { useEffect, useRef } from "react";
import YouTube, { YouTubePlayer } from "react-youtube";
import { useYoutubePlayer } from "./youtube-player";

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
    play,
    unmute,
    resolvePlaying,
    resetWaitPlaying,
  } = useYoutubePlayer();

  const currentVideoIdRef = useRef<string | undefined>("");

  const opts = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 0, // เราคุมเอง
      controls: 0,
      disablekb: 1,
      modestbranding: 1,
      rel: 0,
      iv_load_policy: 3,
      mute: 1, // เริ่มต้นด้วย Mute เสมอเพื่อกัน Autoplay Block
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

    // ถ้าตอนโหลดครั้งแรก User เคยเปิดเสียงมาแล้ว ให้เปิดเสียงรอเลย
    if (show && hasUserUnmuted) {
      player.unMute();
      player.setVolume(100);
    } else {
      player.mute();
    }

    // อย่าเพิ่งสั่ง Play ตรงนี้ รอ useEffect ทำงาน
    player.pauseVideo();
  };

  const handleStateChange = (e: { data: number; target: YouTubePlayer }) => {
    const state = e.data;
    const player = e.target;

    // ดึงค่าล่าสุดจาก Store โดยตรงเพื่อกันค่า Stale ใน Callback
    const currentState = useYoutubePlayer.getState();

    if (state === 1) {
      // Playing
      resolvePlaying?.();
    } else if (state === 2) {
      // Paused
      resetWaitPlaying?.();

      // 🔥 FIX: Windows Protection
      // ถ้าสถานะบอกว่าต้อง "เล่น" และ "แสดงผล" อยู่ แต่มันดัน Pause (โดน Browser สกัด)
      // ให้สั่ง Play ซ้ำทันที
      if (currentState.show && currentState.isPlay) {
        console.log("Auto-resume trigger for Windows");
        player.playVideo();
      }
    } else if (state === 0) {
      // Ended
      resetWaitPlaying?.();
    }
  };

  // 1. จัดการการเปลี่ยน Video ID
  useEffect(() => {
    const player = useYoutubePlayer.getState().player;
    if (!player || !youtubeId) return;

    if (currentVideoIdRef.current !== youtubeId) {
      currentVideoIdRef.current = youtubeId;

      // 🔥 FIX: ไม่ใช้ setInterval และไม่สั่ง unMute ซ้ำซ้อน
      if (hasUserUnmuted) {
        // โหลดวิดีโอเฉยๆ Player จะจำค่า Unmute จากวิดีโอเก่าเอง
        player.loadVideoById({
          videoId: youtubeId,
          startSeconds: 0,
        });
      } else {
        // ถ้ายังไม่เคยเปิดเสียง ต้อง Mute ก่อนโหลด
        player.mute();
        player.loadVideoById({
          videoId: youtubeId,
          startSeconds: 0,
        });
      }
    }
  }, [youtubeId, hasUserUnmuted]);

  // 2. จัดการ Play/Pause/Show
  useEffect(() => {
    const player = useYoutubePlayer.getState().player;
    if (!player) return;

    // Safety check for iframe
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
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  }, [show, isPlay]);

  const handleToggleMute = () => {
    const player = useYoutubePlayer.getState().player;
    if (!player) return;

    // User Interaction ของจริง -> Browser ยอมรับแน่นอน
    setHasUserUnmuted(true);
    setShowVolumeButton(false);

    player.unMute();
    player.setVolume(100);
    play(); // สั่ง Store ให้เล่น
    player.playVideo(); // สั่ง Player โดยตรงด้วยเพื่อความไว
  };

  return (
    <>
      {/* YouTube Video */}
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
            opts={{
              ...opts,
              width: "100%",
              height: "100%",
            }}
            onReady={handleReady}
            onStateChange={handleStateChange}
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>
      </div>

      {/* ปุ่มเปิดเสียง */}
      {showVolumeButton && show && (
        <button
          onClick={handleToggleMute}
          className="fixed bottom-8 right-6 z-50 bg-white/90 text-black px-6 py-3 rounded-full shadow-xl backdrop-blur-md hover:bg-white hover:scale-105 transition-all font-semibold animate-pulse"
        >
          🔊 เปิดเสียง
        </button>
      )}
    </>
  );
};

export default YoutubeEngine;
