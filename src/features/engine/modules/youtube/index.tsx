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
      mute: 1,
      playsinline: 1,
      fs: 0,
      enablejsapi: 1,
    },
  };

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

  const handleReady = (event: { target: YouTubePlayer }) => {
    const player = event.target;
    setPlayer(player);
    setIsReady(true);
    currentVideoIdRef.current = youtubeId;

    if (isIOS()) {
      player.mute();
      player.playVideo();
      setShowVolumeButton(true);
      setHasUserUnmuted(false);
    } else {
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

  useEffect(() => {
    const player = useYoutubePlayer.getState().player;
    if (!player || !youtubeId) return;

    if (currentVideoIdRef.current !== youtubeId) {
      currentVideoIdRef.current = youtubeId;
      const loadOpts = { videoId: youtubeId, startSeconds: 0 };

      if (isIOS()) {
        player.mute();
        player.loadVideoById(loadOpts);
        player.playVideo();
        setShowVolumeButton(true);
        setHasUserUnmuted(false);
      } else {
        if (hasUserUnmuted) {
          player.loadVideoById(loadOpts);

          player.playVideo();

          const check = setInterval(() => {
            const state = player.getPlayerState();

            if (state === -1 || state === 5) {
              player.unMute();
              player.setVolume(100);

              player.playVideo();

              clearInterval(check);
            }

            if (state === 1) {
              player.unMute();
              clearInterval(check);
            }
          }, 100);

          setTimeout(() => clearInterval(check), 3000);
        } else {
          player.mute();
          player.loadVideoById(loadOpts);
          player.playVideo();
          setShowVolumeButton(true);
        }
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
