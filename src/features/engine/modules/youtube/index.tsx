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
  // ตัวแปรเช็คว่า User เคยแตะหน้าจอหรือยัง (สำหรับ iOS)
  const isGlobalUnlockedRef = useRef(false);

  const opts = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 0, // เราคุม Play เอง
      controls: 0,
      disablekb: 1,
      modestbranding: 1,
      rel: 0,
      iv_load_policy: 3,
      mute: 0, // Default เป็น 0 ไว้ก่อน แล้วไปสั่ง Mute ใน Code เฉพาะ iOS
      playsinline: 1,
      fs: 0,
      enablejsapi: 1,
    },
  };

  // ✅ เทคนิค #1: The First-Touch Hijack (สำหรับ iOS เท่านั้น)
  // ดักจับ Event อะไรก็ได้ทีนึง เพื่อ Unlock เสียง Video
  useEffect(() => {
    if (!isIOS()) return; // Android ไม่ต้องใช้ Logic นี้

    const handleGlobalInteraction = () => {
      if (isGlobalUnlockedRef.current) return;

      const player = useYoutubePlayer.getState().player;
      if (player && typeof player.playVideo === "function") {
        console.log("👆 iOS First Interaction: Unlocking Audio...");

        // สั่ง Play + Unmute ทันทีที่มีการแตะหน้าจอ
        player.unMute();
        player.setVolume(100);
        player.playVideo();

        setHasUserUnmuted(true);
        setShowVolumeButton(false);
        isGlobalUnlockedRef.current = true;

        // ลบ Listener ออกเพื่อ Performance
        window.removeEventListener("click", handleGlobalInteraction);
        window.removeEventListener("touchstart", handleGlobalInteraction);
        window.removeEventListener("keydown", handleGlobalInteraction);
      }
    };

    // ดักทุกทางที่เป็นไปได้
    window.addEventListener("click", handleGlobalInteraction, {
      passive: false,
    });
    window.addEventListener("touchstart", handleGlobalInteraction, {
      passive: false,
    });
    window.addEventListener("keydown", handleGlobalInteraction, {
      passive: false,
    });

    return () => {
      window.removeEventListener("click", handleGlobalInteraction);
      window.removeEventListener("touchstart", handleGlobalInteraction);
      window.removeEventListener("keydown", handleGlobalInteraction);
    };
  }, []);

  // ✅ Handle Ready: แยก Logic ชัดเจน
  const handleReady = (event: { target: YouTubePlayer }) => {
    const player = event.target;
    setPlayer(player);
    setIsReady(true);
    currentVideoIdRef.current = youtubeId;

    if (isIOS()) {
      // 🍎 iOS: ต้อง Mute ก่อนเสมอ กัน Error และรอ Hijack หรือปุ่ม Unmute
      console.log("🍎 iOS Ready: Muting initially");
      player.mute();
      if (!isGlobalUnlockedRef.current) {
        // ถ้ายังไม่เคยแตะหน้าจอเลย ให้ Pause รอไว้ หรือเล่นแบบใบ้
        player.playVideo();
      }
    } else {
      // 🤖 Android / PC: จัดเต็ม Unmute + Play เลย
      console.log("🤖 Android/PC Ready: Aggressive Start");
      player.unMute();
      player.setVolume(100);
      player.playVideo();
      // Force state ว่า unmuted แล้ว
      setHasUserUnmuted(true);
      setShowVolumeButton(false);
    }
  };

  const handleStateChange = (e: { data: number; target: YouTubePlayer }) => {
    const state = e.data;
    const player = e.target;
    const currentState = useYoutubePlayer.getState();

    if (state === 1) {
      // Playing
      resolvePlaying?.();

      // เช็คเสียงหายเฉพาะ iOS
      if (isIOS()) {
        const isMuted = player.isMuted?.() ?? true;
        if (isMuted && currentState.hasUserUnmuted) {
          // พยายาม Unmute อีกรอบ
          player.unMute();
        }
      } else {
        // Android: ถ้าเล่นอยู่ ต้องมั่นใจว่าเสียงเปิด
        if (player.isMuted()) {
          player.unMute();
        }
      }
    } else if (state === 2) {
      // Paused
      resetWaitPlaying?.();

      // Auto-resume ถ้าควรจะเล่นอยู่
      if (currentState.show && currentState.isPlay) {
        player.playVideo();
      }
    } else if (state === 0) {
      // Ended
      resetWaitPlaying?.();
    }
  };

  // ✅ เทคนิค #2: Seamless Loading (แก้บั๊ก Android ไม่มีเสียงตรงนี้)
  useEffect(() => {
    const player = useYoutubePlayer.getState().player;
    if (!player || !youtubeId) return;

    if (currentVideoIdRef.current !== youtubeId) {
      console.log("🎵 Loading new video:", youtubeId);
      currentVideoIdRef.current = youtubeId;

      const loadOpts = {
        videoId: youtubeId,
        startSeconds: 0,
      };

      if (isIOS()) {
        // 🍎 iOS Logic
        if (hasUserUnmuted || isGlobalUnlockedRef.current) {
          // ถ้าเคย Unlock แล้ว ให้โหลดและ Unmute
          player.loadVideoById(loadOpts);
          setTimeout(() => {
            player.unMute();
            player.playVideo();
          }, 100);
        } else {
          // ถ้ายังไม่ Unlock ต้อง Mute
          player.mute();
          player.loadVideoById(loadOpts);
          player.playVideo(); // เล่นแบบเงียบๆ ไปก่อน
          setShowVolumeButton(true);
        }
      } else {
        // 🤖 Android / Desktop Logic (แก้จุดที่ User เจอ)
        // สั่ง Unmute ก่อนโหลด หรือหลังโหลดทันที
        player.unMute();
        player.setVolume(100);

        // ใช้ loadVideoById แล้ว Play เลย
        player.loadVideoById(loadOpts);

        // กันเหนียวสำหรับ Android บางรุ่นที่ load แล้วแอบ Mute
        setTimeout(() => {
          player.unMute();
        }, 500);
      }
    }
  }, [youtubeId]);

  // Control Play/Pause
  useEffect(() => {
    const player = useYoutubePlayer.getState().player;
    if (!player) return;

    // Safety check for iframe
    try {
      if (!player.getIframe()) return;
    } catch (e) {
      return;
    }

    if (!show) {
      player.pauseVideo();
      return;
    }

    if (isPlay) {
      play(); // สั่ง store ให้ update
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  }, [show, isPlay]);

  // ปุ่มกดเปิดเสียง (Fallback)
  const handleToggleMute = () => {
    const player = useYoutubePlayer.getState().player;
    if (!player) return;

    setHasUserUnmuted(true);
    setShowVolumeButton(false);
    isGlobalUnlockedRef.current = true; // จำค่าไว้ด้วย

    player.unMute();
    player.setVolume(100);
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
            // คำนวณ Aspect Ratio ให้เต็มจอเสมอ
            width: "100vw",
            height: "100vh",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none", // ป้องกัน user ไปกด pause/play ที่ตัววิดีโอโดยตรง
          }}
        >
          {/* Wrapper เพื่อขยาย Video ให้เกินขอบจอ (ตัดขอบดำ) ถ้าต้องการ */}
          <div className="w-full h-full relative">
            <YouTube
              videoId={youtubeId}
              opts={opts}
              onReady={handleReady}
              onStateChange={handleStateChange}
              className="absolute top-0 left-0 w-full h-full"
              iframeClassName="w-full h-full"
            />
          </div>
        </div>
      </div>

      {showVolumeButton && show && (
        <button
          onClick={handleToggleMute}
          className="fixed bottom-8 right-6 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-xl backdrop-blur-md hover:from-purple-600 hover:to-pink-600 hover:scale-105 transition-all font-semibold animate-pulse"
        >
          🔊 แตะเพื่อเปิดเสียง
        </button>
      )}
    </>
  );
};

export default YoutubeEngine;
