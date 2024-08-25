"use client";
import React, { useRef, useState } from "react";

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
    <body>
      <div onClick={handleClick}>Open</div>
      <audio src="/test.wav" controls={false} autoPlay={false} ref={audioRef} />
    </body>
  );
};

export default AllowSound;
