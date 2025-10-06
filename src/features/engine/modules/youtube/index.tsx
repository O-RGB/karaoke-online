import React, { useEffect, useRef, useState } from "react";
import YouTube, { YouTubePlayer } from "react-youtube";
import { useYoutubePlayer } from "./youtube-player";

interface YoutubeEngineProps {}

const YoutubeEngine: React.FC<YoutubeEngineProps> = () => {
  const { youtubeId, setIsReady, isPlay, show } = useYoutubePlayer();
  const playerRef = useRef<YouTubePlayer | null>(null);
  const currentVideoIdRef = useRef<string | undefined>("");
  const hasUserUnmutedRef = useRef(false); // เก็บว่า user กดอนุญาติแล้วหรือยัง

  const [showVolumeButton, setShowVolumeButton] = useState(true);

  const opts = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      modestbranding: 1,
      showinfo: 0,
      rel: 0,
      iv_load_policy: 3,
      mute: 1,
      playsinline: 1,
    },
  };

  const handleReady = (event: { target: YouTubePlayer }) => {
    playerRef.current = event.target;
    currentVideoIdRef.current = youtubeId;
    setIsReady(true);

    if (show) {
      event.target.playVideo();
      if (!hasUserUnmutedRef.current) {
        event.target.mute();
      } else {
        event.target.unMute();
        event.target.setVolume(100);
      }
    }
  };

  const handleStateChange = (e: { data: number }) => {
    const isCurrentlyPlaying = e.data === 1;
    console.log("Is playing:", isCurrentlyPlaying);
  };

  // เปลี่ยนวิดีโอเมื่อ youtubeId เปลี่ยน (ไม่ rerender)
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !youtubeId) return;

    // ถ้า id เปลี่ยน ให้ load วิดีโอใหม่โดยไม่ rerender
    if (currentVideoIdRef.current !== youtubeId) {
      console.log("Loading new video:", youtubeId);
      currentVideoIdRef.current = youtubeId;

      player.loadVideoById({
        videoId: youtubeId,
        startSeconds: 0,
      });

      // ถ้า user อนุญาติเสียงแล้ว ให้เล่นพร้อมเสียงเลย
      if (hasUserUnmutedRef.current) {
        setTimeout(() => {
          player.unMute();
          player.setVolume(100);
          player.playVideo();
        }, 100);
      } else {
        player.mute();
      }
    }
  }, [youtubeId]);

  // ควบคุมการเล่นและ show
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

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

  const handleToggleMute = async () => {
    const player = playerRef.current;
    if (!player) return;

    try {
      // บันทึกว่า user อนุญาติเสียงแล้ว (ครั้งเดียวตลอดไป)
      hasUserUnmutedRef.current = true;
      setShowVolumeButton(false);

      // เปิดเสียง
      player.unMute();
      player.setVolume(100);

      // เล่นต่อ
      setTimeout(() => {
        player.playVideo();
      }, 100);

      console.log("User has granted audio permission");
    } catch (err) {
      console.error("Failed to unmute:", err);
    }
  };

  return (
    <>
      {/* YouTube Video - render ครั้งเดียว ไม่ rerender ตาม youtubeId */}
      <div
        className={`${
          show ? "fixed inset-0 -z-10 w-full h-full" : "opacity-0"
        }`}
      >
        <YouTube
          videoId={youtubeId}
          opts={opts}
          onReady={handleReady}
          onStateChange={handleStateChange}
          className="rounded-lg overflow-hidden w-full h-full"
        />
      </div>

      {/* ปุ่มเปิดเสียง - แสดงเฉพาะครั้งแรก */}
      {showVolumeButton && show && (
        <button
          onClick={handleToggleMute}
          className="fixed bottom-6 right-6 z-50 bg-white/90 text-black px-6 py-3 rounded-full shadow-xl backdrop-blur-md hover:bg-white hover:scale-105 transition-all font-semibold animate-pulse"
        >
          🔊 เปิดเสียง
        </button>
      )}
    </>
  );
};

export default YoutubeEngine;
