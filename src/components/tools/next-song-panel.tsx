import { useOrientation } from "@/hooks/orientation-hook";
import useMixerStore from "@/stores/mixer-store";
import { usePlayer } from "@/stores/player-store";
import React, { useEffect, useState } from "react";

interface NextSongPanelProps {}

const NextSongPanel: React.FC<NextSongPanelProps> = ({}) => {
  const { orientation } = useOrientation();
  const hideMixer = useMixerStore((state) => state.hideMixer);
  const countDown = usePlayer((state) => state.countDown);
  const playingQueue = usePlayer((state) => state.playingQueue);
  const isFinished = usePlayer((state) => state.isFinished);

  const [saveInfo, setInfo] = useState<SearchResult>();
  useEffect(() => {
    if (playingQueue.length > 1 && countDown > 1) {
      setInfo(playingQueue[1].songInfo);
    } else if (playingQueue.length === 1) {
      setInfo(undefined);
    }
  }, [countDown]);

  if (
    (isFinished === false && countDown > 3) ||
    playingQueue.length < 1 ||
    !saveInfo
  ) {
    return <></>;
  }

  return (
    <>
      <div
        className={`fixed ${
          orientation === "landscape"
            ? "top-[90px]"
            : hideMixer
            ? "top-[140px] lg:top-[100px]"
            : "top-[400px] lg:top-[250px]"
        } w-full h-20 px-20 flex flex-col justify-center items-center gap-2`}
      >
        <div className=" flex justify-center gap-10">
          <div
            className={`${
              countDown <= 3 ? "bg-white/70" : "bg-white/20"
            } w-10 h-10 rounded-full border flex items-center justify-center text-xl font-bold text-white`}
          >
            3
          </div>
          <div
            className={`${
              countDown <= 2 ? "bg-white/70" : "bg-white/20"
            } w-10 h-10 rounded-full border flex items-center justify-center text-xl font-bold text-white`}
          >
            2
          </div>
          <div
            className={`${
              countDown <= 1 ? "bg-white/70" : "bg-white/20"
            } w-10 h-10 rounded-full border flex items-center justify-center text-xl font-bold text-white`}
          >
            1
          </div>
        </div>
        <div className="text-xl text-white">
          {saveInfo?.name} - {saveInfo?.artist}
        </div>
      </div>
    </>
  );
};

export default NextSongPanel;
