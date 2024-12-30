"use client";
import React, { useLayoutEffect, useRef, useState } from "react";
import Button from "../common/button/button";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import LoadConfig from "../ui/load-conifg/load-config";
import { initDatabase } from "@/utils/database/db";

interface AllowSoundProps {
  children?: React.ReactNode;
}

const AllowSound: React.FC<AllowSoundProps> = ({ children }) => {
  const [ended, setEnded] = useState<boolean>(false);
  const [pressed, setPressed] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioLoopRef = useRef<HTMLAudioElement>(null);

  const requestMIDIAccess = async () => {
    if (navigator.requestMIDIAccess) {
      try {
        const access = await navigator.requestMIDIAccess();
        return access; // ส่งกลับ MIDI access
      } catch (error) {
        console.error("Error accessing MIDI devices:", error);
        return null; // ส่งกลับ null ถ้ามีข้อผิดพลาด
      }
    } else {
      console.log("Web MIDI API is not supported in this browser.");
      return null; // ส่งกลับ null ถ้าไม่รองรับ
    }
  };

  const handleClick = () => {
    if (audioRef.current && audioLoopRef.current) {
      const audio = audioRef.current;
      const audioLoop = audioLoopRef.current;

      setPressed(true);
      audio.volume = 0.5;
      audioLoop.volume = 0.2;
      audio.play();
      audioLoop.play();
      audio.addEventListener("ended", () => {
        setEnded(true);
      });
    }
  };

  useLayoutEffect(() => {
    requestMIDIAccess();
    initDatabase();
  }, []);

  return (
    <>
      <LoadConfig></LoadConfig>
      {ended ? (
        children
      ) : (
        <div className="flex h-screen w-screen -m-2.5 items-center justify-center">
          <div className="">
            <span className="flex items-center flex-col text-white pb-2 text-sm">
              <span>🌷 Happy new year 2025 🌷</span>
            </span>
            {!pressed && (
              <span className="flex items-center flex-col text-white pb-2 text-sm">
                <span>เวอร์ชันนี้</span>
                <span>คุณต้องรีเซ็ตระบบก่อนใช้งาน</span>
              </span>
            )}
            {pressed ? (
              <div className="flex items-center gap-2 text-white font-bold">
                <AiOutlineLoading3Quarters className="text-lg animate-spin"></AiOutlineLoading3Quarters>
                Karaoke Startup
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-fit">
                  <div className="absolute -right-0.5 -top-0.5 w-fit">
                    <span className="relative flex h-3 w-3 ">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                    </span>
                  </div>
                  <Button
                    blur={false}
                    color="white"
                    className="w-fit"
                    onClick={handleClick}
                  >
                    <div className="px-2">Allow Sound</div>
                  </Button>
                </div>
                <span className="pt-1 text-xs text-white">
                  🎇🔥 Updated v.1.0.28 🔥🎇
                </span>
                <br />
                <span className="text-xs text-center text-white">
                  <span className="flex gap-1 items-center">
                    แนะนำให้ใช้งานใน{" "}
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/a/a0/Firefox_logo%2C_2019.svg"
                      alt=""
                      className="w-5 h-5"
                    />
                    <span>Firefox </span>
                  </span>
                  <span className="text-center">ทั้ง ios, android</span>
                </span>

                <span className="text-xs text-center text-white pt-1">
                  <span className="flex gap-1 items-center">
                    รองรับการโหลดเพลงจาก{" "}
                    <img src="/icon/gd.ico" alt="" className="w-5 h-5" />
                    <span>Google Drive </span>
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      <audio
        src="/sound/startup.mp3"
        controls={false}
        autoPlay={false}
        ref={audioRef}
      />
      <audio
        loop
        src="/sound/allow-sound.mp3"
        controls={false}
        autoPlay={false}
        ref={audioLoopRef}
      />
    </>
  );
};

export default AllowSound;
