import React, { useEffect, useRef } from "react";
import YouTube, { YouTubePlayer } from "react-youtube";
import { useYoutubePlayer } from "./youtube-player";

interface YoutubeEngineProps {}

const YoutubeEngine: React.FC<YoutubeEngineProps> = () => {
  const { youtubeId, setIsReady, isPlay, show } = useYoutubePlayer();
  const playerRef = useRef<YouTubePlayer | null>(null);

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
    },
  };

  const handleReady = (event: { target: YouTubePlayer }) => {
    playerRef.current = event.target;
    setIsReady(true);

    event.target.playVideo();

    setTimeout(() => {
      event.target.unMute();
    }, 500);
  };

  const handleStateChange = (e: { data: number }) => {
    const isCurrentlyPlaying = e.data === 1;
    console.log("Is playing:", isCurrentlyPlaying);
  };

  // 🎯 ตรงนี้สำคัญ — ควบคุม play/pause ตาม isPlay
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    if (isPlay) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  }, [isPlay]);

  return (
    <div
      className={`${show ? "fixed inset-0 -z-10 w-full h-full" : "opacity-0"} `}
    >
      <YouTube
        videoId={youtubeId}
        opts={opts}
        onReady={handleReady}
        onStateChange={handleStateChange}
        className="rounded-lg overflow-hidden w-full h-full"
      />
    </div>
  );
};

export default YoutubeEngine;
