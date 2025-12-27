import React, { useEffect, useRef } from "react";
import YouTube, { YouTubePlayer } from "react-youtube";
import { useYoutubePlayer, isIOS } from "./youtube-player";

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
  const isLoadingNewVideoRef = useRef(false);

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

    if (show && hasUserUnmuted) {
      player.unMute();
      player.setVolume(100);
    } else {
      player.mute();
    }

    player.pauseVideo();
  };

  const handleStateChange = (e: { data: number; target: YouTubePlayer }) => {
    const state = e.data;
    const player = e.target;
    const currentState = useYoutubePlayer.getState();

    // ✅ FIX: เมื่อเริ่มเล่น (state = 1) ต้องเช็คว่าเสียงเปิดอยู่หรือไม่
    if (state === 1) {
      // กำลังเล่นอยู่

      // ถ้าผู้ใช้เปิดเสียงไว้ ต้องบังคับ unmute ทุกครั้ง (สำคัญมากบน iOS!)
      if (currentState.hasUserUnmuted) {
        player.unMute();
        player.setVolume(100);
      }

      resolvePlaying?.();
      isLoadingNewVideoRef.current = false;
    } else if (state === 3) {
      // กำลังโหลด (buffering)

      // ✅ ช่วงนี้คือโอกาสดีที่จะตั้งค่าเสียงก่อนเล่น
      if (currentState.hasUserUnmuted && !isLoadingNewVideoRef.current) {
        player.unMute();
        player.setVolume(100);
      }
    } else if (state === 2) {
      // หยุดชั่วคราว (paused)
      resetWaitPlaying?.();

      if (currentState.show && currentState.isPlay) {
        console.log("Auto-resume trigger");
        player.playVideo();
      }
    } else if (state === 0) {
      // จบวิดีโอ
      resetWaitPlaying?.();
    } else if (state === 5) {
      // พร้อมเล่น (cued)

      // ✅ ถ้าเปิดเสียงไว้ ต้อง unmute ก่อนเล่น
      if (currentState.hasUserUnmuted) {
        player.unMute();
        player.setVolume(100);
      }
    }
  };

  // ✅ เปลี่ยนเพลงพร้อมรักษาสถานะเสียง
  useEffect(() => {
    const player = useYoutubePlayer.getState().player;
    if (!player || !youtubeId) return;

    if (currentVideoIdRef.current !== youtubeId) {
      console.log("🎵 Loading new video:", youtubeId);
      currentVideoIdRef.current = youtubeId;
      isLoadingNewVideoRef.current = true;

      // ✅ สำคัญ: ตั้งค่าเสียงก่อนโหลด
      if (hasUserUnmuted) {
        player.unMute();
        player.setVolume(100);
      } else {
        player.mute();
      }

      // โหลดวิดีโอใหม่
      player.loadVideoById({
        videoId: youtubeId,
        startSeconds: 0,
      });

      // ✅ iOS Fix: รอ 100ms แล้ว unmute อีกครั้ง
      if (hasUserUnmuted && isIOS()) {
        setTimeout(() => {
          if (player && player.unMute) {
            player.unMute();
            player.setVolume(100);
            console.log("🔊 iOS: Force unmute after loadVideo");
          }
        }, 100);
      }
    }
  }, [youtubeId, hasUserUnmuted]);

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
      play();
    } else {
      player.pauseVideo();
    }
  }, [show, isPlay]);

  const handleToggleMute = () => {
    const player = useYoutubePlayer.getState().player;
    if (!player) return;

    console.log("🔊 User unmuted - will persist for all videos");

    setHasUserUnmuted(true);
    setShowVolumeButton(false);

    player.unMute();
    player.setVolume(100);
    play();
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

      {/* ปุ่มเปิดเสียง - กดครั้งเดียว ใช้ได้ตลอด */}
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
