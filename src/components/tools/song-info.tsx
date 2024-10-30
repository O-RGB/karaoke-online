import { useOrientation } from "@/hooks/orientation-hook";
import useMixerStore from "@/stores/mixer-store";
import { usePlayer } from "@/stores/player-store";
import React, { useEffect, useState } from "react";

interface SongInfoProps {}

const SongInfo: React.FC<SongInfoProps> = ({}) => {
  const { orientation } = useOrientation();
  const hideMixer = useMixerStore((state) => state.hideMixer);
  const songPlayingInfo = usePlayer((state) => state.songPlayingInfo);

  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    setShow(true);
    setTimeout(() => {
      setShow(false);
    }, 5000);
  }, [songPlayingInfo]);

  if (!show) return <></>;
  return (
    <>
      <div
        className={`fixed ${
          orientation === "landscape"
            ? "top-[60px] lg:top-[90px] right-0"
            : hideMixer
            ? "top-[130px] lg:top-[100px] left-0"
            : "top-[395px] lg:top-[220px] left-0"
        }  w-fit h-20 px-5   flex flex-col   gap-2 `}
      >
        <div className="p-3 border blur-overlay rounded-md text-white ">
          ชื่อเพลง: {songPlayingInfo?.name} <br />
          นักร้อง: {songPlayingInfo?.artist}
        </div>
      </div>
    </>
  );
};

export default SongInfo;
