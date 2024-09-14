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

  const handleClick = () => {
    if (audioRef.current) {
      const audio = audioRef.current;

      setPressed(true);
      audio.volume = 0.2;
      audio.play();
      audio.addEventListener("ended", () => {
        setEnded(true);
      });
    }
  };

  if (ended) return <>{children}</>;
  return (
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
            <Button color="white" onClick={handleClick}>
              <div className="px-2 ">Allow Sound</div>
            </Button>
          </>
        )}
        <audio
          src="/windows-7.mp3"
          controls={false}
          autoPlay={false}
          ref={audioRef}
        />
      </div>
    </div>
  );
};

export default AllowSound;
