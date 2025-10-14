import React, { useEffect, useRef, useState } from "react";
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
    pause,
    unmute,
    mute,
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

    player.pauseVideo();

    if (show) {
      if (!hasUserUnmuted) {
        player.mute();
      } else {
        player.unMute();
        player.setVolume(100);
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

  useEffect(() => {
    const player = useYoutubePlayer.getState().player;
    if (!player || !youtubeId) return;

    if (currentVideoIdRef.current !== youtubeId) {
      currentVideoIdRef.current = youtubeId;

      if (hasUserUnmuted) {
        player.loadVideoById({ videoId: youtubeId, startSeconds: 0 });
        const check = setInterval(() => {
          const state = player.getPlayerState();
          if (state === -1 || state === 5) {
            player.unMute();
            player.setVolume(100);

            clearInterval(check);
          }
        }, 100);
        setTimeout(() => clearInterval(check), 3000);
      } else {
        player.loadVideoById({ videoId: youtubeId, startSeconds: 0 });
        player.mute();
      }
    }
  }, [youtubeId]);

  useEffect(() => {
    const player = useYoutubePlayer.getState().player;
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
    const player = useYoutubePlayer.getState().player;
    if (!player) return;

    setHasUserUnmuted(true);
    setShowVolumeButton(false);
    unmute();
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
            width: `${window.innerHeight * (16 / 9)}px`,
            height: `${window.innerHeight}px`,
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

      {/* ปุ่มเปิดเสียง */}
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
