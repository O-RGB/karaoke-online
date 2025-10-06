import React, { useEffect, useRef, useState } from "react";
import YouTube, { YouTubePlayer } from "react-youtube";
import { useYoutubePlayer } from "./youtube-player";

interface YoutubeEngineProps {}

const YoutubeEngine: React.FC<YoutubeEngineProps> = () => {
  const { youtubeId, setIsReady, isPlay, show } = useYoutubePlayer();
  const playerRef = useRef<YouTubePlayer | null>(null);

  const [isMuted, setIsMuted] = useState(true);
  const [hasUnmutedOnce, setHasUnmutedOnce] = useState(false);
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
      mute: 1, // เริ่ม muted
    },
  };

  const handleReady = (event: { target: YouTubePlayer }) => {
    playerRef.current = event.target;
    setIsReady(true);

    // ถ้า show true เล่นวิดีโอ (ยัง muted)
    if (show) {
      playerRef.current.playVideo();
      playerRef.current.mute();
    }
  };

  const handleStateChange = (e: { data: number }) => {
    const isCurrentlyPlaying = e.data === 1;
    console.log("Is playing:", isCurrentlyPlaying);
  };

  // ควบคุมเล่น/หยุด และเสียงตาม show
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    if (!show) {
      player.pauseVideo();
      player.mute();
      return;
    }

    if (isPlay) player.playVideo();
    else player.pauseVideo();

    // restore เสียงถ้า unmuted แล้ว
    if (!isMuted && hasUnmutedOnce) {
      try {
        player.unMute();
        setShowVolumeButton(false);
      } catch (err) {
        console.error("Failed to unmute:", err);
        setShowVolumeButton(true);
      }
    }
  }, [show, isPlay, isMuted, hasUnmutedOnce]);

  const handleToggleMute = () => {
    const player = playerRef.current;
    if (!player) return;

    try {
      player.unMute();
      setIsMuted(false);
      setHasUnmutedOnce(true);
      setShowVolumeButton(false);
    } catch (err) {
      console.error("Failed to unmute:", err);
      setShowVolumeButton(true);
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
          className="fixed bottom-6 right-6 z-50 bg-white/80 text-black px-4 py-2 rounded-full shadow-lg backdrop-blur-md hover:bg-white transition-all"
        >
          🔊 เปิดเสียง
        </button>
      )}
    </>
  );
};

export default YoutubeEngine;
