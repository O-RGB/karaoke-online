import React, { useRef, useState } from "react";
import Wallpaper from "../../wallpaper";

interface AllowSoundProps {
  children: React.ReactNode;
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
    <>
      <Wallpaper blur>
        <div>
          {
            <div className="relative ">
              <div
                onClick={handleClick}
                className="p-3 rounded-lg border cursor-pointer bg-white hover:bg-gray-200 duration-300 flex justify-center items-center gap-3"
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative rounded-full h-3 w-3 bg-sky-500"></span>
                </span>
                {pressed == false ? (
                  <div>เปิดเสียงเบราว์เซอร์</div>
                ) : (
                  <div>กำลังโหลด</div>
                )}
              </div>
            </div>
          }

          <audio
            src="/ping.mp3"
            controls={false}
            autoPlay={false}
            ref={audioRef}
          />
        </div>
      </Wallpaper>
    </>
  );
};

export default AllowSound;
