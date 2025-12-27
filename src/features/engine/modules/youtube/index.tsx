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
      autoplay: 0, // ปิด autoplay ของ iframe แล้วคุมด้วย js
      controls: 0,
      disablekb: 1,
      modestbranding: 1,
      rel: 0,
      iv_load_policy: 3,
      mute: 1, // [CRITICAL] ค่าเริ่มต้นต้อง mute ไว้ก่อนเสมอสำหรับ Mobile
      playsinline: 1, // [CRITICAL] ต้องมีเพื่อให้ iOS เล่นในหน้าเว็บได้ไม่เด้ง Fullscreen
      fs: 0,
      enablejsapi: 1,
    },
  };

  const handleReady = (event: { target: YouTubePlayer }) => {
    const player = event.target;
    setPlayer(player);
    setIsReady(true);
    currentVideoIdRef.current = youtubeId;

    // ถ้าผู้ใช้เคยเปิดเสียงแล้ว ให้เปิดเสียงตาม
    if (show && hasUserUnmuted) {
      player.unMute();
      player.setVolume(100);
    } else {
      player.mute();
    }

    // รอคำสั่ง play จาก Store
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

      // Fix: บางครั้ง iOS หรือ Browser หยุดเอง เราต้องสั่งเล่นต่อถ้า State บอกว่าต้องเล่น
      if (currentState.show && currentState.isPlay) {
        console.log("Auto-resume trigger");
        // เรียก play() ของ store เพื่อผ่าน logic check ios อีกรอบ หรือสั่งตรงก็ได้
        // แต่การสั่งตรงอาจติด Autoplay policy บน iOS ถ้าไม่มี interaction
        // ในที่นี้ถ้ามันเคยเล่นแล้วหยุด มันมักจะ resume ได้
        player.playVideo();
      }
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

      if (hasUserUnmuted) {
        player.loadVideoById({
          videoId: youtubeId,
          startSeconds: 0,
        });
      } else {
        // ถ้ายังไม่ unmute หรือเป็น iOS ที่ต้องการความชัวร์ ให้ mute ก่อนโหลด
        player.mute();
        player.loadVideoById({
          videoId: youtubeId,
          startSeconds: 0,
        });
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
      // เรียก play() ผ่าน store เพื่อให้ผ่าน Logic isIOS ที่เราแก้
      play();
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

    // สั่งเล่นอีกครั้งเพื่อความชัวร์
    play();
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

      {/* ปุ่มเปิดเสียง (แสดงเฉพาะเมื่อยังไม่ได้เปิดเสียงและวิดีโอโชว์อยู่) */}
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
