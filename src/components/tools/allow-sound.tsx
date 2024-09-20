"use client";
import React, { useRef, useState } from "react";
import Button from "../common/button/button";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface AllowSoundProps {
  children?: React.ReactNode;
}

const AllowSound: React.FC<AllowSoundProps> = ({ children }) => {
  const [ended, setEnded] = useState<boolean>(false);
  const [pressed, setPressed] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioLoopRef = useRef<HTMLAudioElement>(null);

  const handleClick = () => {
    if (audioRef.current && audioLoopRef.current) {
      const audio = audioRef.current;
      const audioLoop = audioLoopRef.current;

      setPressed(true);
      audio.volume = 0.2;
      audioLoop.volume = 0.2;
      audio.play();
      audioLoop.play();
      audio.addEventListener("ended", () => {
        setEnded(true);
      });
    }
  };

  return (
    <>
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
                <Button  blur={false} color="white" onClick={handleClick}>
                  <div className="px-2 ">Allow Sound</div>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
      <audio
        src="/windows-7.mp3"
        controls={false}
        autoPlay={false}
        ref={audioRef}
      />
      <audio
        loop
        src="/e.mp3"
        controls={false}
        autoPlay={false}
        ref={audioLoopRef}
      />
    </>
  );
};

export default AllowSound;
