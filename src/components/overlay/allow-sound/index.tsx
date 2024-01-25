import React, { useRef, useState } from "react";

interface AllowSoundProps {
  children: React.ReactNode;
}

const AllowSound: React.FC<AllowSoundProps> = ({ children }) => {
  const [ended, setEnded] = useState(false);
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
    <>
      <div>
        {!pressed && ended == false && (
          <div
            onClick={handleClick}
            className="p-3 rounded-lg border cursor-pointer bg-white"
          >
            เปิดเสียงเบราว์เซอร์
          </div>
        )}

        <audio
          src="/ping.mp3"
          controls={false}
          autoPlay={false}
          ref={audioRef}
        />
      </div>
    </>
  );
};

export default AllowSound;
