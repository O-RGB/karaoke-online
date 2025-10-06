import React, { useEffect, useRef, useState } from "react";
import YouTube, { YouTubePlayer } from "react-youtube";
import { useYoutubePlayer } from "./youtube-player";

interface YoutubeEngineProps {}

const YoutubeEngine: React.FC<YoutubeEngineProps> = () => {
  const { youtubeId, setIsReady, isPlay, show } = useYoutubePlayer();
  const playerRef = useRef<YouTubePlayer | null>(null);
  const isUnmutingRef = useRef(false);

  const [isMuted, setIsMuted] = useState(true);
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
      playsinline: 1, // สำคัญมากสำหรับ iOS/Safari
    },
  };

  const handleReady = (event: { target: YouTubePlayer }) => {
    playerRef.current = event.target;
    setIsReady(true);

    if (show) {
      event.target.playVideo();
      event.target.mute();
    }
  };

  const handleStateChange = (e: { data: number }) => {
    const isCurrentlyPlaying = e.data === 1;
    console.log("Is playing:", isCurrentlyPlaying);

    // ถ้ากำลัง unmute แล้ววิดีโอหยุด ให้เล่นต่อทันที
    if (!isCurrentlyPlaying && isUnmutingRef.current) {
      setTimeout(() => {
        playerRef.current?.playVideo();
      }, 100);
    }
  };

  // ควบคุมการเล่นและเสียง
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    if (!show) {
      player.pauseVideo();
      player.mute();
      setShowVolumeButton(true);
      return;
    }

    // จัดการเสียง (ไม่ให้มันหยุดวิดีโอ)
    if (isMuted) {
      player.mute();
    } else {
      try {
        player.unMute();
        player.setVolume(100);
      } catch (err) {
        console.error("Unmute error:", err);
      }
    }

    // จัดการเล่น/หยุด
    if (isPlay) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  }, [show, isPlay, isMuted]);

  const handleToggleMute = async () => {
    const player = playerRef.current;
    if (!player) return;

    isUnmutingRef.current = true;

    try {
      // วิธี Safari-safe: เก็บตำแหน่งปัจจุบัน
      const currentTime = await player.getCurrentTime();

      // unmute และ set volume
      player.unMute();
      player.setVolume(100);

      // เล่นต่อจากตำแหน่งเดิม
      player.seekTo(currentTime, true);
      player.playVideo();

      // รอให้แน่ใจว่าเล่นแล้ว
      setTimeout(() => {
        player.playVideo();
        isUnmutingRef.current = false;
      }, 200);

      setIsMuted(false);
      setShowVolumeButton(false);
    } catch (err) {
      console.error("Failed to unmute:", err);
      isUnmutingRef.current = false;

      // fallback: reload วิดีโอพร้อมเสียง
      try {
        const currentTime = await player.getCurrentTime();
        player.loadVideoById({
          videoId: youtubeId,
          startSeconds: currentTime,
        });
        player.unMute();
        player.setVolume(100);

        setIsMuted(false);
        setShowVolumeButton(false);
      } catch (reloadErr) {
        console.error("Reload failed:", reloadErr);
        setShowVolumeButton(true);
      }
    }
  };

  return (
    <>
      {/* YouTube Video */}
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

      {/* ปุ่มเปิดเสียง */}
      {showVolumeButton && show && (
        <button
          onClick={handleToggleMute}
          className="fixed bottom-6 right-6 z-50 bg-white/90 text-black px-6 py-3 rounded-full shadow-xl backdrop-blur-md hover:bg-white hover:scale-105 transition-all font-semibold"
        >
          🔊 เปิดเสียง
        </button>
      )}
    </>
  );
};

export default YoutubeEngine;
