import { useOrientation } from "@/hooks/orientation-hook";
import useMixerStoreNew from "@/features/player/event-player/modules/event-mixer-store";
import useRuntimePlayer from "@/features/player/player/modules/runtime-player";
import React, { useEffect, useState } from "react";

interface SongInfoProps {
  className?: string;
}

const SongInfo: React.FC<SongInfoProps> = ({ className }) => {
  const musicInfo = useRuntimePlayer((state) => state.musicInfo);

  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    setShow(true);
    setTimeout(() => {
      setShow(false);
    }, 5000);
  }, [musicInfo]);

  if (!show) return <></>;
  return (
    <div className={`${className}`}>
      <div className={`w-fit h-20 flex flex-col gap-2 `}>
        <div className="p-3 border blur-overlay rounded-md text-white ">
          ชื่อเพลง: {musicInfo?.TITLE} <br />
          นักร้อง: {musicInfo?.ARTIST}
        </div>
      </div>
    </div>
  );
};

export default SongInfo;
