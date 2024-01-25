import { PropsWithChildren, useRef, useState } from "react";

import { Button, Flex, Heading } from "@chakra-ui/react";
import Wallpaper from "../wallpaper";

export function Splash({ children }: PropsWithChildren) {
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

  // If the audio has ended, we can render the children
  if (ended) return <>{children}</>;

  // If the audio has not ended, we can render the splash screen
  return (
    <div>
      {!pressed ? (
        <div
          onClick={handleClick}
          className="p-3 rounded-lg border cursor-pointer bg-white"
        >
          Click ยอมรับให้มีเสียงในเบราว์เซอร์
        </div>
      ) : (
        <div className="p-3 rounded-lg border cursor-pointer bg-white">
          กำลังโหลด
        </div>
      )}

      <audio src="/ping.mp3" controls={false} autoPlay={false} ref={audioRef} />
    </div>
  );
}
