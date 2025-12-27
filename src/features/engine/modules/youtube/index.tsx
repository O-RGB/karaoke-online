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
    setHasUserUnmuted, // ใช้ตัวนี้เพื่อ Reset state ใน iOS
    play,
    resolvePlaying,
    resetWaitPlaying,
  } = useYoutubePlayer();

  const currentVideoIdRef = useRef<string | undefined>("");
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
      mute: 1, // Default mute ไว้ก่อน
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

  // 2. Handle Ready
  const handleReady = (event: { target: YouTubePlayer }) => {
    const player = event.target;
    setPlayer(player);
    setIsReady(true);
    currentVideoIdRef.current = youtubeId;

    if (isIOS()) {
      // 🍎 iOS: บังคับ Mute และโชว์ปุ่มเสมอ ตอนเริ่ม
      player.mute();
      player.playVideo();
      setShowVolumeButton(true);
      setHasUserUnmuted(false); // Reset state ว่ายังไม่ได้เปิดเสียง
    } else {
      // 🤖 Android/PC: เช็คว่าเคยเปิดเสียงมาหรือยัง
      if (hasUserUnmuted) {
        player.unMute();
        player.setVolume(100);
        player.playVideo();
        setShowVolumeButton(false);
      } else {
        player.mute();
        player.playVideo();
        setShowVolumeButton(true);
      }
    }
  };

  const handleStateChange = (e: { data: number }) => {
    const state = e.data;
    if (state === 1) {
      resolvePlaying?.();
    } else if (state === 2 || state === 0) {
      resetWaitPlaying?.();
    }
  };

  // 3. Logic เปลี่ยนวิดีโอ (หัวใจสำคัญอยู่ตรงนี้)
  useEffect(() => {
    const player = useYoutubePlayer.getState().player;
    if (!player || !youtubeId) return;

    if (currentVideoIdRef.current !== youtubeId) {
      currentVideoIdRef.current = youtubeId;
      const loadOpts = { videoId: youtubeId, startSeconds: 0 };

      if (isIOS()) {
        // 🍎 iOS: บังคับ Mute + โชว์ปุ่มทุก Link!
        console.log("🍎 iOS New Video: Force Mute & Show Button");
        player.mute();
        player.loadVideoById(loadOpts);
        player.playVideo();

        setShowVolumeButton(true); // บังคับโชว์ปุ่ม
        setHasUserUnmuted(false); // Reset state
      } else {
        // 🤖 Android: เช็ค State เดิม
        if (hasUserUnmuted) {
          // ถ้าเคยเปิดเสียงแล้ว -> ใช้สูตร Force Loop ให้เสียงมาต่อเนื่อง
          console.log("🤖 Android: Keeping Audio On");
          player.loadVideoById(loadOpts);

          // Loop กระชากเสียง (สูตรที่คุณชอบ)
          const check = setInterval(() => {
            const state = player.getPlayerState();
            if (state === -1 || state === 5 || state === 3) {
              player.unMute();
              player.setVolume(100);
            }
            if (state === 1) {
              player.unMute();
              clearInterval(check);
            }
          }, 100);
          setTimeout(() => clearInterval(check), 3000);
        } else {
          // ถ้ายังไม่เคยเปิดเสียง -> Mute + โชว์ปุ่ม
          player.mute();
          player.loadVideoById(loadOpts);
          player.playVideo();
          setShowVolumeButton(true);
        }
      }
    }
  }, [youtubeId]);

  // 4. Play/Pause Control
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

  // 5. ปุ่มเปิดเสียง (กดแล้ว Unmute)
  const handleToggleMute = () => {
    const player = useYoutubePlayer.getState().player;
    if (!player) return;

    setHasUserUnmuted(true); // จำค่าไว้ (มีผลกับ Android รอบหน้า)
    setShowVolumeButton(false);

    player.unMute();
    player.setVolume(100);
    player.playVideo();
  };

  return (
    <>
      {/* Background Video */}
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

      {/* ปุ่มเปิดเสียง (Glassmorphism) */}
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
