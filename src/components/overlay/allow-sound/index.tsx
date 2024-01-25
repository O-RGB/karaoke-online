import React, { useRef, useState } from "react";

interface AllowSoundProps {}

const AllowSound: React.FC<AllowSoundProps> = ({}) => {
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
