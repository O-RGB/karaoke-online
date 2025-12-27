import React, { useEffect, useRef } from "react";
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
  const audioContextRef = useRef<AudioContext | null>(null);
  const isAudioUnlockedRef = useRef(false);
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);

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

  // ✅ เทคนิค #1: สร้าง Audio Context และ Silent Audio
  useEffect(() => {
    if (!isIOS()) return;

    // สร้าง AudioContext
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    } catch (err) {
      console.log("AudioContext not available");
    }

    // สร้าง silent audio element
    silentAudioRef.current = new Audio(
      "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhAC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAUHAAAAAAAAAOGAXBSPVgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    );
    silentAudioRef.current.loop = false;

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // ✅ เทคนิค #2: Unlock Audio Context
  const unlockAudioContext = async () => {
    if (!isIOS() || isAudioUnlockedRef.current) return;

    try {
      // Unlock AudioContext
      if (
        audioContextRef.current &&
        audioContextRef.current.state === "suspended"
      ) {
        await audioContextRef.current.resume();
        console.log("🔓 AudioContext unlocked");
      }

      // เล่น silent audio
      if (silentAudioRef.current) {
        await silentAudioRef.current.play();
        silentAudioRef.current.pause();
        silentAudioRef.current.currentTime = 0;
        console.log("🔇 Silent audio played");
      }

      isAudioUnlockedRef.current = true;
    } catch (err) {
      console.log("Failed to unlock audio:", err);
    }
  };

  const handleReady = (event: { target: YouTubePlayer }) => {
    const player = event.target;
    setPlayer(player);
    setIsReady(true);
    currentVideoIdRef.current = youtubeId;

    player.mute();
    player.pauseVideo();
  };

  const handleStateChange = (e: { data: number; target: YouTubePlayer }) => {
    const state = e.data;
    const player = e.target;
    const currentState = useYoutubePlayer.getState();

    if (state === 1) {
      resolvePlaying?.();

      // ✅ เทคนิค #3: ตรวจสอบเสียงหาย (iOS)
      if (isIOS()) {
        const isMuted = player.isMuted?.() ?? true;
        if (isMuted && currentState.hasUserUnmuted) {
          console.log("🔇 iOS: Sound lost, showing button again");
          setShowVolumeButton(true);
          setHasUserUnmuted(false);
        }
      }
    } else if (state === 2) {
      resetWaitPlaying?.();

      if (isIOS() && currentState.hasUserUnmuted) {
        console.log("⏸️ iOS: Video paused, may need unmute again");
        setShowVolumeButton(true);
        setHasUserUnmuted(false);
      }

      if (currentState.show && currentState.isPlay) {
        console.log("Auto-resume trigger");
        player.playVideo();
      }
    } else if (state === 0) {
      resetWaitPlaying?.();
    }
  };

  // ✅ เทคนิค #4: Aggressive Video Loading
  useEffect(() => {
    const player = useYoutubePlayer.getState().player;
    if (!player || !youtubeId) return;

    if (currentVideoIdRef.current !== youtubeId) {
      console.log("🎵 Loading new video:", youtubeId);
      currentVideoIdRef.current = youtubeId;

      if (isIOS()) {
        // iOS: ถ้า unlock แล้ว ลองเล่นต่อเนื่อง
        if (isAudioUnlockedRef.current && hasUserUnmuted) {
          console.log("🍎 iOS: Attempting seamless transition");

          // ลองใช้ cueVideoById แทน loadVideoById
          player.unMute();
          player.setVolume(100);
          player.cueVideoById({
            videoId: youtubeId,
            startSeconds: 0,
          });

          // เล่นทันที (same call stack)
          setTimeout(() => {
            player.playVideo();
          }, 50);
        } else {
          // ยังไม่ unlock → แสดงปุ่ม
          setHasUserUnmuted(false);
          setShowVolumeButton(true);
          player.mute();
          player.loadVideoById({
            videoId: youtubeId,
            startSeconds: 0,
          });
        }
      } else {
        // Android: ทำงานปกติ
        if (hasUserUnmuted) {
          player.unMute();
          player.setVolume(100);
        } else {
          player.mute();
        }
        player.loadVideoById({
          videoId: youtubeId,
          startSeconds: 0,
        });
      }
    }
  }, [youtubeId]);

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

      if (isIOS() && hasUserUnmuted) {
        setShowVolumeButton(true);
        setHasUserUnmuted(false);
      }
      return;
    }

    if (isPlay) {
      play();
    } else {
      player.pauseVideo();
    }
  }, [show, isPlay]);

  // ✅ เทคนิค #5: Ultimate Unlock
  const handleToggleMute = async () => {
    const player = useYoutubePlayer.getState().player;
    if (!player) return;

    console.log("🔊 User clicked unmute - UNLOCKING EVERYTHING");

    // Unlock audio context ก่อน
    await unlockAudioContext();

    setHasUserUnmuted(true);
    setShowVolumeButton(false);

    player.unMute();
    player.setVolume(100);

    // เล่นทันทีหลัง unmute
    setTimeout(() => {
      player.playVideo();
    }, 100);
  };

  return (
    <>
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

      {showVolumeButton && show && (
        <button
          onClick={handleToggleMute}
          className="fixed bottom-8 right-6 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-xl backdrop-blur-md hover:from-purple-600 hover:to-pink-600 hover:scale-105 transition-all font-semibold animate-pulse"
        >
          🔊 เปิดเสียง
        </button>
      )}
    </>
  );
};

export default YoutubeEngine;
