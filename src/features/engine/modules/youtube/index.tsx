import React, { useEffect, useRef, useState } from "react";
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
  const isGlobalUnlockedRef = useRef(false);
  const [videoSize, setVideoSize] = useState({ w: 0, h: 0 });

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
      mute: 0,
      playsinline: 1,
      fs: 0,
      enablejsapi: 1,
    },
  };

  // 1. คำนวณขนาดวิดีโอ (Cover Screen)
  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const windowRatio = windowWidth / windowHeight;
      const videoRatio = 16 / 9;

      let w, h;
      if (windowRatio < videoRatio) {
        h = windowHeight;
        w = windowHeight * videoRatio;
      } else {
        w = windowWidth;
        h = windowWidth / videoRatio;
      }
      setVideoSize({ w: Math.ceil(w) + 20, h: Math.ceil(h) + 20 });
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 2. Global Event Listener (First-Touch Hijack)
  useEffect(() => {
    if (!isIOS()) return;

    const handleGlobalInteraction = () => {
      if (isGlobalUnlockedRef.current) return;
      const player = useYoutubePlayer.getState().player;

      if (player && typeof player.playVideo === "function") {
        console.log("👆 iOS Interaction Detected: Unlocking...");
        player.unMute();
        player.setVolume(100);
        player.playVideo();

        // Update State
        setHasUserUnmuted(true);
        setShowVolumeButton(false);
        isGlobalUnlockedRef.current = true;

        // Clean up
        window.removeEventListener("click", handleGlobalInteraction);
        window.removeEventListener("touchstart", handleGlobalInteraction);
      }
    };

    window.addEventListener("click", handleGlobalInteraction, {
      passive: false,
    });
    window.addEventListener("touchstart", handleGlobalInteraction, {
      passive: false,
    });

    return () => {
      window.removeEventListener("click", handleGlobalInteraction);
      window.removeEventListener("touchstart", handleGlobalInteraction);
    };
  }, []);

  // 3. Handle Ready (จุดที่แก้: สั่งโชว์ปุ่มตรงนี้)
  const handleReady = (event: { target: YouTubePlayer }) => {
    const player = event.target;
    setPlayer(player);
    setIsReady(true);
    currentVideoIdRef.current = youtubeId;

    if (isIOS()) {
      // 🍎 iOS:
      player.mute(); // Mute ก่อนเสมอ

      if (!isGlobalUnlockedRef.current) {
        // ถ้ายังไม่ Unlock -> เล่นแบบใบ้ + โชว์ปุ่มทันที
        player.playVideo();
        setShowVolumeButton(true); // <--- บรรทัดสำคัญที่เพิ่มมา
        setHasUserUnmuted(false);
      }
    } else {
      // 🤖 Android/PC:
      player.unMute();
      player.setVolume(100);
      player.playVideo();
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
      if (isIOS()) {
        // ถ้าเล่นอยู่ แต่เสียงยังปิด และ User กดเปิดแล้ว -> พยายามเปิดเสียงอีกรอบ
        const isMuted = player.isMuted?.() ?? true;
        if (isMuted && currentState.hasUserUnmuted) {
          player.unMute();
        }
      } else {
        if (player.isMuted()) player.unMute();
      }
    } else if (state === 2) {
      // Paused
      resetWaitPlaying?.();
      if (currentState.show && currentState.isPlay) player.playVideo();
    } else if (state === 0) {
      // Ended
      resetWaitPlaying?.();
    }
  };

  // 4. Handle Video Change
  useEffect(() => {
    const player = useYoutubePlayer.getState().player;
    if (!player || !youtubeId) return;

    if (currentVideoIdRef.current !== youtubeId) {
      currentVideoIdRef.current = youtubeId;
      const loadOpts = { videoId: youtubeId, startSeconds: 0 };

      if (isIOS()) {
        if (hasUserUnmuted || isGlobalUnlockedRef.current) {
          player.loadVideoById(loadOpts);
          setTimeout(() => {
            player.unMute();
            player.playVideo();
          }, 100);
        } else {
          // New video, no permission yet
          player.mute();
          player.loadVideoById(loadOpts);
          player.playVideo();
          setShowVolumeButton(true); // บังคับโชว์ปุ่มเมื่อเปลี่ยนวิดีโอใหม่
        }
      } else {
        player.unMute();
        player.setVolume(100);
        player.loadVideoById(loadOpts);
      }
    }
  }, [youtubeId]);

  // 5. Play/Pause Control
  useEffect(() => {
    const player = useYoutubePlayer.getState().player;
    if (!player) return;
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
      play();
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  }, [show, isPlay]);

  const handleToggleMute = () => {
    const player = useYoutubePlayer.getState().player;
    if (!player) return;

    console.log("🔊 Button Clicked: Unmuting...");
    setHasUserUnmuted(true);
    setShowVolumeButton(false);
    isGlobalUnlockedRef.current = true;

    player.unMute();
    player.setVolume(100);
    player.playVideo();
  };

  return (
    <>
      <div
        className={`fixed inset-0 -z-10 overflow-hidden bg-black transition-opacity duration-500 ${
          show ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute top-1/2 left-1/2 overflow-hidden pointer-events-none"
          style={{
            width: `${videoSize.w}px`,
            height: `${videoSize.h}px`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <YouTube
            videoId={youtubeId}
            opts={opts}
            onReady={handleReady}
            onStateChange={handleStateChange}
            className="w-full h-full"
            iframeClassName="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Overlay ปุ่มเปิดเสียง 
         - ใช้ z-[9999] เพื่อให้อยู่บนสุดแน่นอน
         - ตรวจสอบ showVolumeButton && show
      */}
      {showVolumeButton && show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <button
            onClick={handleToggleMute}
            className="group relative flex flex-col items-center justify-center 
                       w-48 h-48 rounded-3xl 
                       bg-white/10 border border-white/20 
                       backdrop-blur-xl shadow-2xl
                       hover:scale-105 hover:bg-white/20 transition-all duration-300
                       cursor-pointer animate-pulse"
          >
            <div className="text-6xl mb-4 filter drop-shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
              🔊
            </div>
            <span className="text-white font-bold text-lg tracking-wider drop-shadow-md">
              เปิดเสียง
            </span>
            <div className="absolute inset-0 rounded-3xl border-2 border-white/10 scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500"></div>
          </button>
        </div>
      )}
    </>
  );
};

export default YoutubeEngine;
