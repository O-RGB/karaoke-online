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

  // State สำหรับเก็บขนาดวิดีโอเพื่อให้เต็มจอ (Cover Mode)
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

  // ✅ 1. คำนวณขนาดวิดีโอให้เต็มจอเสมอ (Cover Logic)
  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const windowRatio = windowWidth / windowHeight;
      const videoRatio = 16 / 9;

      let w, h;

      // ถ้าจอ "ยาวกว่า" สัดส่วนวิดีโอ (เช่น จอมือถือแนวตั้ง) -> ยึดความสูงเป็นหลัก
      // ถ้าจอ "กว้างกว่า" สัดส่วนวิดีโอ (เช่น จอคอม) -> ยึดความกว้างเป็นหลัก
      if (windowRatio < videoRatio) {
        h = windowHeight;
        w = windowHeight * videoRatio;
      } else {
        w = windowWidth;
        h = windowWidth / videoRatio;
      }

      // เผื่อ scale นิดหน่อยกันขอบหลุด
      setVideoSize({ w: Math.ceil(w) + 20, h: Math.ceil(h) + 20 });
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // คำนวณทีแรกทันที

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ 2. iOS First-Touch Hijack
  useEffect(() => {
    if (!isIOS()) return;

    const handleGlobalInteraction = () => {
      if (isGlobalUnlockedRef.current) return;
      const player = useYoutubePlayer.getState().player;

      if (player && typeof player.playVideo === "function") {
        console.log("👆 iOS First Interaction: Unlocking Audio...");
        player.unMute();
        player.setVolume(100);
        player.playVideo();
        setHasUserUnmuted(true);
        setShowVolumeButton(false);
        isGlobalUnlockedRef.current = true;

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

  // ✅ 3. Handle Ready & Video Change Logic
  const handleReady = (event: { target: YouTubePlayer }) => {
    const player = event.target;
    setPlayer(player);
    setIsReady(true);
    currentVideoIdRef.current = youtubeId;

    if (isIOS()) {
      player.mute();
      if (!isGlobalUnlockedRef.current) {
        player.playVideo();
      }
    } else {
      // Android/PC: เริ่มแบบเปิดเสียงเลย
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
        const isMuted = player.isMuted?.() ?? true;
        if (isMuted && currentState.hasUserUnmuted) player.unMute();
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
          player.mute();
          player.loadVideoById(loadOpts);
          player.playVideo();
          setShowVolumeButton(true);
        }
      } else {
        // Android fix
        player.unMute();
        player.setVolume(100);
        player.loadVideoById(loadOpts);
      }
    }
  }, [youtubeId]);

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

      {/* ✅ ปุ่มเปิดเสียงใหม่: ใหญ่ กลางจอ เบลอสวย */}
      {showVolumeButton && show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <button
            onClick={handleToggleMute}
            className="group relative flex flex-col items-center justify-center 
                       w-48 h-48 rounded-3xl 
                       bg-white/10 border border-white/20 
                       backdrop-blur-xl shadow-2xl
                       hover:scale-105 hover:bg-white/20 transition-all duration-300
                       animate-pulse"
          >
            {/* ไอคอนลำโพง */}
            <div className="text-6xl mb-4 filter drop-shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
              🔊
            </div>
            {/* ข้อความ */}
            <span className="text-white font-bold text-lg tracking-wider drop-shadow-md">
              เปิดเสียง
            </span>

            {/* วงแหวน Glow Effect */}
            <div className="absolute inset-0 rounded-3xl border-2 border-white/10 scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500"></div>
          </button>
        </div>
      )}
    </>
  );
};

export default YoutubeEngine;
