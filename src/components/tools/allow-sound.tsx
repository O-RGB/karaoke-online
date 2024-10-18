"use client";
import React, { useLayoutEffect, useRef, useState } from "react";
import Button from "../common/button/button";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import LoadConfig from "../ui/load-conifg/load-config";
import { getLocalSystemMode } from "@/lib/local-storege/local-storage";
import { getTracklist } from "@/lib/storage/tracklist";
import { initDatabase } from "@/utils/database/db";
import addTracklist from "../modal/append-song/tabs/add-tracklist";

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
          <div className="relative">
            {pressed ? (
              <div className="flex items-center gap-2 text-white font-bold">
                <AiOutlineLoading3Quarters className="text-lg animate-spin"></AiOutlineLoading3Quarters>
                Karaoke Startup
              </div>
            ) : (
              <>
                <div className="absolute -right-0.5 -top-0.5 ">
                  <span className="relative flex h-3 w-3 ">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                  </span>
                </div>
                <Button blur={false} color="white" onClick={handleClick}>
                  <div className="px-2">Allow Sound</div>
                </Button>
              </>
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
