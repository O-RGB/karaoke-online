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

    // เริ่มต้นด้วย mute เสมอ
    player.mute();
    player.pauseVideo();
  };

  const handleStateChange = (e: { data: number; target: YouTubePlayer }) => {
    const state = e.data;
    const player = e.target;
    const currentState = useYoutubePlayer.getState();

    if (state === 1) {
      // กำลังเล่นอยู่
      resolvePlaying?.();

      // ✅ iOS: เช็คว่าเสียงหายหรือไม่
      if (isIOS()) {
        const isMuted = player.isMuted?.() ?? true;
        if (isMuted && currentState.hasUserUnmuted) {
          // เสียงหาย แต่ควรจะมีเสียง → แสดงปุ่มอีกครั้ง
          console.log("🔇 iOS: Sound lost, showing button again");
          setShowVolumeButton(true);
          setHasUserUnmuted(false);
        }
      }
    } else if (state === 2) {
      // หยุดชั่วคราว (paused)
      resetWaitPlaying?.();

      // ✅ iOS: ถ้า pause จาก remote หรือ stop → แสดงปุ่มอีกครั้ง
      if (isIOS() && currentState.hasUserUnmuted) {
        console.log("⏸️ iOS: Video paused, may need unmute again");
        setShowVolumeButton(true);
        setHasUserUnmuted(false);
      }

      if (currentState.show && currentState.isPlay) {
        console.log("Auto-resume trigger");
        player.playVideo();
      }
    } else if (state === 0) {
      // จบวิดีโอ
      resetWaitPlaying?.();
    }
  };

  // ✅ เปลี่ยนเพลง: iOS แสดงปุ่มทุกครั้ง, Android ไม่ต้อง
  useEffect(() => {
    const player = useYoutubePlayer.getState().player;
    if (!player || !youtubeId) return;

    if (currentVideoIdRef.current !== youtubeId) {
      console.log("🎵 Loading new video:", youtubeId);
      currentVideoIdRef.current = youtubeId;

      if (isIOS()) {
        // ✅ iOS: Reset ให้แสดงปุ่มทุกครั้ง
        console.log("🍎 iOS: Showing unmute button for new video");
        setHasUserUnmuted(false);
        setShowVolumeButton(true);
        player.mute();
        player.loadVideoById({
          videoId: youtubeId,
          startSeconds: 0,
        });
      } else {
        // ✅ Android: ใช้สถานะเดิม ไม่ต้องกดใหม่
        if (hasUserUnmuted) {
          player.unMute();
          player.setVolume(100);
        } else {
          player.mute();
        }
        player.loadVideoById({
          videoId: youtubeId,
          startSeconds: 0,
        });
      }
    }
  }, [youtubeId]);

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

      // ✅ iOS: ถ้าซ่อน player → แสดงปุ่มอีกครั้งเมื่อกลับมา
      if (isIOS() && hasUserUnmuted) {
        setShowVolumeButton(true);
        setHasUserUnmuted(false);
      }
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

    console.log("🔊 User clicked unmute");

    setHasUserUnmuted(true);
    setShowVolumeButton(false);

    player.unMute();
    player.setVolume(100);

    // ให้แน่ใจว่าเล่นหลัง unmute
    setTimeout(() => {
      player.playVideo();
    }, 100);
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

      {/* ✅ iOS: แสดงปุ่มทุกครั้ง | Android: แสดงเฉพาะครั้งแรก */}
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
