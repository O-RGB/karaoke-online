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
    play, // สั่ง Store ให้ isPlay = true
    setPause, // สั่ง Store ให้ isPlay = false
    resolvePlaying,
    resetWaitPlaying,
  } = useYoutubePlayer();

  const currentVideoIdRef = useRef<string | undefined>("");
  // ใช้ Ref เพื่อเช็คว่า User Unmuted จริงๆ โดยไม่อิง State ใน render cycle
  const hasUserUnmutedRef = useRef(hasUserUnmuted);

  // Sync Ref กับ State
  useEffect(() => {
    hasUserUnmutedRef.current = hasUserUnmuted;
  }, [hasUserUnmuted]);

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

    if (isIOS()) {
      // iOS: เริ่มต้นเงียบเสมอ รอ User กดปุ่ม
      player.mute();
      setHasUserUnmuted(false);
      setShowVolumeButton(true);
    } else {
      // Android/PC: ถ้าเคยเปิดเสียงแล้ว ให้เปิดเสียงรอเลย
      if (show && hasUserUnmutedRef.current) {
        player.unMute();
        player.setVolume(100);
      } else {
        player.mute();
      }
    }

    // เริ่มต้นให้ Pause ไว้ก่อน รอคำสั่งจาก Effect
    player.pauseVideo();
  };

  const handleStateChange = (e: { data: number; target: YouTubePlayer }) => {
    const state = e.data;
    const player = e.target;
    const currentState = useYoutubePlayer.getState();

    // 1 = Playing
    if (state === 1) {
      resolvePlaying?.();
      // 🔥 FIX Android: ถ้า Youtube บอกว่าเล่น Store ต้องรู้ว่าเล่น
      if (!currentState.isPlay) {
        play();
      }
    }
    // 2 = Paused
    else if (state === 2) {
      resetWaitPlaying?.();

      // 🔥 FIX Android: ป้องกันการ Pause เองตอนโหลดเพลงใหม่
      // ถ้า Store บอกว่าเล่นอยู่ แต่ Player ดัน Pause (อาจจะเพราะกำลัง Buffer หรือเปลี่ยนเพลง)
      // อย่าเพิ่งสั่ง setPause(false) เข้า Store ทันที ให้เช็คก่อน
      if (currentState.show && currentState.isPlay) {
        // พยายาม Resume
        player.playVideo();
      } else {
        // ถ้า User ตั้งใจ Pause จริงๆ
        setPause(false);
      }
    }
    // 0 = Ended
    else if (state === 0) {
      resetWaitPlaying?.();
      // จบเพลง -> ต้อง setPause เพื่อให้ Queue รู้ว่าจบ (หรือ Queue อาจจะจับจากเวลา)
      setPause(false);
    }
    // -1 = Unstarted, 5 = Cued
    else if (state === -1 || state === 5) {
      // ถ้า Android ค้างที่ State นี้ตอนเปลี่ยนเพลง ให้ถีบมันไปต่อ
      if (currentState.show && currentState.isPlay && !isIOS()) {
        player.playVideo();
      }
    }
  };

  // 1. จัดการการเปลี่ยน Video ID (หัวใจสำคัญของการแก้ปัญหา)
  // ❌ เอา hasUserUnmuted ออกจาก dependency array เพื่อไม่ให้โหลดซ้ำตอนกดปุ่มเปิดเสียง
  useEffect(() => {
    const currentState = useYoutubePlayer.getState();
    const player = currentState.player;

    if (!player || !youtubeId) return;

    // เช็คว่า ID เปลี่ยนจริงๆ หรือไม่
    if (currentVideoIdRef.current !== youtubeId) {
      currentVideoIdRef.current = youtubeId;

      // --- กรณี iOS ---
      // เปลี่ยนเพลงทุกครั้ง -> ต้อง Reset ให้กดเปิดเสียงใหม่ทุกครั้ง
      if (isIOS()) {
        setHasUserUnmuted(false);
        setShowVolumeButton(true);
        player.mute();
        player.loadVideoById({ videoId: youtubeId, startSeconds: 0 });
        player.pauseVideo(); // รอ User กดปุ่ม
        return;
      }

      // --- กรณี Android / Desktop ---
      const isCurrentlyUnmuted = hasUserUnmutedRef.current; // ใช้ Ref ค่าล่าสุด

      if (isCurrentlyUnmuted) {
        // 1. สั่งโหลด
        player.loadVideoById({ videoId: youtubeId, startSeconds: 0 });
        player.unMute(); // ย้ำอีกที

        // 2. 🔥 FIX ANDROID: สั่ง Store ให้เป็น Playing ทันที!
        // ไม่ต้องรอ onStateChange เพราะมันช้าและอาจเพี้ยน
        play();
        player.playVideo();
      } else {
        // ยังไม่เคยเปิดเสียง (Autoplay แบบ Mute)
        player.mute();
        player.loadVideoById({ videoId: youtubeId, startSeconds: 0 });

        // ถ้าคิวรันอยู่ ก็ให้เล่นต่อ (แบบเงียบ)
        if (currentState.isPlay) {
          play(); // ย้ำ Store
          player.playVideo();
        }
      }
    }
  }, [youtubeId]); // 🔥 ลบ hasUserUnmuted ออกจากตรงนี้ แก้ปัญหา iOS เสียงหาย

  // 2. จัดการ Play/Pause/Show ตาม State
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
      // iOS กันเหนียว: ห้ามสั่ง Play ถ้ายังไม่ Unmute (รอปุ่ม)
      if (isIOS() && !hasUserUnmuted) {
        return;
      }
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  }, [show, isPlay, hasUserUnmuted]); // เพิ่ม hasUserUnmuted เข้าไปเพื่อให้ Effect ทำงานตอนกดปุ่ม

  const handleToggleMute = () => {
    const player = useYoutubePlayer.getState().player;
    if (!player) return;

    // 1. อัปเดต State UI
    setHasUserUnmuted(true);
    setShowVolumeButton(false);

    // 2. สั่ง Player โดยตรง (สำคัญมากสำหรับ iOS)
    player.unMute();
    player.setVolume(100);

    // 3. สั่ง Play ทั้ง Store และ Player
    play(); // Store: isPlay = true -> ตัวนับเวลาเริ่มเดิน
    player.playVideo();
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
            opts={{ ...opts, width: "100%", height: "100%" }}
            onReady={handleReady}
            onStateChange={handleStateChange}
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>
      </div>

      {/* ปุ่มเปิดเสียง (Responsive + Glassmorphism) */}
      {showVolumeButton && show && (
        <button
          onClick={handleToggleMute}
          className="
            fixed z-50 
            top-1/2 left-1/2 
            -translate-x-1/2 -translate-y-1/2
            
            flex items-center justify-center gap-3
            
            w-[80vw] max-w-[280px] md:w-auto md:max-w-none
            px-6 py-4 md:px-12 md:py-6
            
            bg-black/40 
            backdrop-blur-xl 
            border border-white/20
            rounded-2xl md:rounded-full
            shadow-[0_8px_32px_rgba(0,0,0,0.3)]
            
            text-white font-bold tracking-wide
            cursor-pointer
            
            transition-all duration-300 ease-out
            hover:scale-105 active:scale-95
          "
        >
          <span className="text-2xl md:text-3xl">🔊</span>
          <span className="text-lg md:text-2xl whitespace-nowrap">
            {isIOS() ? "แตะเพื่อเล่น" : "แตะเพื่อเปิดเสียง"}
          </span>
        </button>
      )}
    </>
  );
};

export default YoutubeEngine;
